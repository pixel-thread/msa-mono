import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { QUERY_KEYS } from '@repo/shared';
import { PaymentTransaction } from '../types';
import { paymentEndpoints } from '../utils/constants/endpoints';

export function usePaymentDetail(paymentId: string | undefined) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.PAYMENTS_KEYS.DETAIL(paymentId),
    queryFn: () => http.get<PaymentTransaction>(paymentEndpoints.byId(paymentId!)),
    enabled: !!paymentId,
  });

  return {
    payment: data?.data ?? null,
    isLoading,
    error,
    refetch,
  };
}
