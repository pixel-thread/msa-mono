import React, { useCallback } from 'react';
import { View } from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import { Ionicons } from '@expo/vector-icons';

import { Button, Text } from '@src/shared/components/ui';
import { logger } from '@src/shared/utils';

import { isRazorpayError } from '../types/razorpay';
import { usePaymentOption } from '../hooks/use-payment-order';
import { useVerifyPayment } from '../hooks/use-verify-payment';
import { useSubscriptionPlans } from '../hooks';
import { useRateLimit } from '@src/shared/hooks/use-rate-limiting';
import { usePaymentProviderStatus } from '@src/shared/hooks/use-payment-status';

export const PayButton = () => {
  const { data: plan, isFetching } = useSubscriptionPlans();
  const { data: provider, isFetching: isFetchingProviderStatus } = usePaymentProviderStatus();
  const { mutateAsync: createPaymentOrder, isPending: isOrderPending } = usePaymentOption();
  const { mutate: verifyPayment, isPending: isVerifyPending } = useVerifyPayment();
  const { isLimited, executeWithLimit, retryAfter } = useRateLimit('PAYMENT_BUTTON', {
    limit: 1,
    windowMs: 10000,
    message: 'You can only pay once every 10 seconds',
  });

  const isProcessing = isOrderPending || isVerifyPending;

  const onClickPay = useCallback(async () => {
    try {
      const { data } = await createPaymentOrder();
      if (data) {
        await RazorpayCheckout.open(data).then((response) => {
          verifyPayment({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
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
  }, [createPaymentOrder, verifyPayment]);

  return (
    <View className="absolute bottom-0 left-0 right-0 border-t border-slate-100 bg-white px-6 pb-10 pt-5 dark:border-slate-800 dark:bg-slate-950">
      {/* Amount Selector */}
      <View className="mb-5 flex-row items-center justify-between">
        <Text className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Payment amount
        </Text>
      </View>
      {/* Pay Button */}
      <Button
        onPress={() => executeWithLimit(() => onClickPay())}
        disabled={
          isProcessing || isFetching || isLimited || isFetchingProviderStatus || !provider?.status
        }
        className="h-14 ">
        {isLimited
          ? retryAfter?.toString()
          : isProcessing
            ? 'Processing...'
            : `Pay ₹${plan?.activeVersion.amount}`}
      </Button>

      {/* Security Note */}
      <View className="mt-4 flex-row items-center justify-center gap-x-1.5">
        <Ionicons name="lock-closed-outline" size={13} color="#94a3b8" />
        <Text variant="subtext" size="xs">
          Secured by Razorpay
        </Text>
      </View>
    </View>
  );
};
