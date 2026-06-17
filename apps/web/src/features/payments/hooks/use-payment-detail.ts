import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useQuery } from '@tanstack/react-query';

import { PaymentTransaction } from '../types';

export function usePaymentDetail(paymentId: string | undefined) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.PAYMENTS_KEYS.DETAIL(paymentId),
    queryFn: () => http.get<PaymentTransaction>(ENDPOINTS.PAYMENTS.DETAIL(paymentId!)),
    enabled: !!paymentId,
  });

  return {
    payment: data?.data ?? null,
    isLoading,
    error,
    refetch,
  };
}
