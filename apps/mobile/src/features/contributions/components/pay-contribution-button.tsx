import React, { useCallback, useState } from 'react';
import RazorpayCheckout from 'react-native-razorpay';

import { Text, Button } from '@src/shared/components/ui';
import { logger } from '@src/shared/utils';

import { isRazorpayError } from '../types/razorpay';
import { usePaymentOption } from '../hooks/use-payment-order';
import { useVerifyPayment } from '../hooks/use-verify-payment';
import { useRateLimit } from '@src/shared/hooks/use-rate-limiting';
import { usePaymentProviderStatus } from '@src/shared/hooks/use-payment-status';
import { ContributionStatus } from '../types';
import { toast } from 'sonner-native';
import { useAuthStore } from '@src/shared/store';

interface PayContributionButtonProps {
  contributionPeriodId: string;
  expectedAmount: number;
  dueAmount: number;
  status: ContributionStatus;
  onSuccess?: () => void;
}

async function canReachRazorpay() {
  try {
    await fetch('https://api.razorpay.com', {
      method: 'HEAD',
    });

    return true;
  } catch {
    return false;
  }
}

export const PayContributionButton = ({
  contributionPeriodId,
  dueAmount,
  status,
  onSuccess,
}: PayContributionButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();
  const { data: provider, isFetching: isFetchingProviderStatus } = usePaymentProviderStatus();

  const { mutateAsync: createPaymentOrder, isPending: isOrderPending } = usePaymentOption();
  const { mutateAsync: verifyPayment, isPending: isVerifyPending } = useVerifyPayment();
  const { isLimited, executeWithLimit } = useRateLimit('CONTRIBUTION_PAY_BUTTON', {
    limit: 1,
    windowMs: 10000,
    message: 'You can only pay once every 10 seconds',
  });

  const isProcessing = isOrderPending || isVerifyPending;

  const handlePay = useCallback(async () => {
    try {
      setIsLoading(true);
      if (!(await canReachRazorpay())) {
        toast.info('Unable to reach Razorpay', {
          description: 'Please check your internet connection, and try again.',
          dismissible: true,
          duration: 5000,
        });
        logger.info('Contribution Payment Skipped - Razorpay Unreachable', {
          contributionPeriodId,
          userId: user?.id,
        });
        return;
      }

      logger.info('Contribution Payment Started', {
        contributionPeriodId,
        userId: user?.id,
      });

      const { data } = await createPaymentOrder(contributionPeriodId);

      logger.info('Contribution Payment Order Created', {
        contributionPeriodId,
        userId: user?.id,
        orderId: data?.order_id,
      });

      if (data) {
        logger.info('Contribution Razorpay Checkout Opened', {
          contributionPeriodId,
          userId: user?.id,
          orderId: data.order_id,
        });

        const response = await RazorpayCheckout.open(data);

        logger.info('Contribution Razorpay Checkout Completed', {
          contributionPeriodId,
          userId: user?.id,
          orderId: response.razorpay_order_id,
          paymentId: response.razorpay_payment_id,
        });

        logger.info('Contribution Verification Started', {
          contributionPeriodId,
          userId: user?.id,
          orderId: response.razorpay_order_id,
          paymentId: response.razorpay_payment_id,
        });

        await verifyPayment({
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        });

        logger.info('Contribution Verification Completed', {
          contributionPeriodId,
          userId: user?.id,
          orderId: response.razorpay_order_id,
          paymentId: response.razorpay_payment_id,
        });

        onSuccess?.();
      }
    } catch (error) {
      if (isRazorpayError(error)) {
        const isCancellation =
          error.code === 0 ||
          error.error?.code === 'BAD_REQUEST_ERROR' ||
          error.description?.toLowerCase().includes('cancelled') ||
          error.description?.toLowerCase().includes('cancel');

        if (isCancellation) {
          logger.info('Contribution Payment Cancelled', {
            contributionPeriodId,
            userId: user?.id,
          });
          toast.info('Payment cancelled');
        } else {
          logger.error('Contribution Payment Error', {
            error: error.error,
            message: error.description,
            reason: error.error.reason,
            code: error.error.code,
            contributionPeriodId,
            userId: user?.id,
          });
        }
      } else {
        logger.error('Contribution Payment Error', {
          error,
          contributionPeriodId,
          userId: user?.id,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [contributionPeriodId, createPaymentOrder, verifyPayment, onSuccess]);

  if (status === 'WAIVED' || status === 'PAID') return null;

  const disabled = isProcessing || isLimited || isFetchingProviderStatus || !provider?.status;

  return (
    <Button
      onPress={() => executeWithLimit(() => handlePay())}
      disabled={disabled || isLoading || isLimited}
      size={'sm'}
      activeOpacity={0.7}>
      <Text className="text-xs font-semibold text-white">Pay Now ₹{dueAmount}</Text>
    </Button>
  );
};
