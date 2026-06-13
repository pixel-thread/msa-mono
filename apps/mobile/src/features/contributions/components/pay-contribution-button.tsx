import React, { useCallback } from 'react';
import RazorpayCheckout from 'react-native-razorpay';

import { Text, Button } from '@src/shared/components/ui';
import { logger } from '@src/shared/utils';
import { cn } from '@lib/cn';

import { isRazorpayError } from '../types/razorpay';
import { usePaymentOption } from '../hooks/use-payment-order';
import { useVerifyPayment } from '../hooks/use-verify-payment';
import { useRateLimit } from '@src/shared/hooks/use-rate-limiting';
import { usePaymentProviderStatus } from '@src/shared/hooks/use-payment-status';
import type { ContributionStatus } from '../types/payment';

interface PayContributionButtonProps {
  contributionPeriodId: string;
  expectedAmount: number;
  dueAmount: number;
  status: ContributionStatus;
  onSuccess?: () => void;
}

export const PayContributionButton = ({
  contributionPeriodId,
  dueAmount,
  status,
  onSuccess,
}: PayContributionButtonProps) => {
  const { data: provider, isFetching: isFetchingProviderStatus } = usePaymentProviderStatus();

  const { mutateAsync: createPaymentOrder, isPending: isOrderPending } = usePaymentOption();
  const { mutate: verifyPayment, isPending: isVerifyPending } = useVerifyPayment();
  const { isLimited, executeWithLimit } = useRateLimit('CONTRIBUTION_PAY_BUTTON', {
    limit: 1,
    windowMs: 10000,
    message: 'You can only pay once every 10 seconds',
  });

  const isProcessing = isOrderPending || isVerifyPending;

  const handlePay = useCallback(async () => {
    try {
      const { data } = await createPaymentOrder(contributionPeriodId);
      if (data) {
        await RazorpayCheckout.open(data).then((response) => {
          verifyPayment({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          onSuccess?.();
        });
      }
    } catch (error) {
      if (isRazorpayError(error)) {
        logger.error('Razorpay Error', {
          error: error.error,
          message: error.description,
          reason: error.error.reason,
          code: error.error.code,
        });
      } else {
        logger.error('Payment Error', { error });
      }
    }
  }, [contributionPeriodId, createPaymentOrder, verifyPayment, onSuccess]);

  if (status === 'WAIVED' || status === 'PAID') return null;

  const disabled = isProcessing || isLimited || isFetchingProviderStatus || !provider?.status;

  return (
    <Button
      onPress={() => executeWithLimit(() => handlePay())}
      disabled={disabled}
      size={'sm'}
      activeOpacity={0.7}>
      <Text className="text-xs font-semibold text-white">Pay Now ₹{dueAmount}</Text>
    </Button>
  );
};
