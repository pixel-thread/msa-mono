import { useMutation, useQueryClient } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { QUERY_KEYS, ENDPOINTS } from '@repo/shared';
import { PaymentProviderPayload, PaymentProvider } from '../types';

export const useAddProvider = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PaymentProviderPayload) =>
      http.post<PaymentProvider>(ENDPOINTS.PAYMENTS.PROVIDERS.CREATE, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PAYMENTS_KEYS.PROVIDERS() });
    },
  });
};

export const useDeleteProvider = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => http.delete(ENDPOINTS.PAYMENTS.PROVIDERS.DELETE(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PAYMENTS_KEYS.PROVIDERS() });
    },
  });
};

export const useActivateProvider = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      http.post<PaymentProvider>(ENDPOINTS.PAYMENTS.PROVIDERS.ACTIVATE(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PAYMENTS_KEYS.PROVIDERS() });
    },
  });
};
