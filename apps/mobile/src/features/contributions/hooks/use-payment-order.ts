import http from '@src/shared/utils/http';
import { useMutation } from '@tanstack/react-query';
import { ENDPOINTS } from '@repo/shared';
import { RazorpayOptions } from '../types/razorpay';
import { toast } from 'sonner-native';

export function usePaymentOption() {
  return useMutation({
    mutationFn: (contributionPeriodId: string) =>
      http.post<RazorpayOptions>(ENDPOINTS.PAYMENTS.RAZORPAY.CREATE_ORDER, {
        contributionPeriodId,
      }),
    onSuccess: (data) => {
      if (data.success) {
        return data.data;
      }
      toast.error(data.message);
      return data.data;
    },
  });
}
