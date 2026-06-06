import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@repo/shared';
import { toast } from 'sonner';
import { paymentEndpoints } from '../utils/constants/endpoints';

export function useActivatePaymentProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (providerId: string) => http.post(paymentEndpoints.activateProvider(providerId), {}),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.PAYMENTS_KEYS.PROVIDERS(),
        });
        return data;
      }
      toast.error(data.message);
      return data;
    },
  });
}
