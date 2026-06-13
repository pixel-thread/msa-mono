import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS, ENDPOINTS } from '@repo/shared';
import { toast } from 'sonner-native';

type PaymentData = {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
};

export function useVerifyPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PaymentData) => http.post(ENDPOINTS.PAYMENTS.RAZORPAY.VERIFY, data),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.PAYMENTS_KEYS.LIST(),
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.CONTRIBUTIONS_KEYS.ALL(),
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.CONTRIBUTIONS_KEYS.LIST(),
        });
        return data;
      }
      toast.error(data.message);
      return data;
    },
  });
}
