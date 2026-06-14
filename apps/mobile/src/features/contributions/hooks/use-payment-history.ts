import http from '@src/shared/utils/http';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS, ENDPOINTS } from '@repo/shared';
import { PaymentSummary, Transaction } from '../types/payment';
import { useAuthStore } from '@src/shared/store';

type PaymentHistory = {
  transactions: Transaction[];
  summary: PaymentSummary;
};

export function usePaymentHistory() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: QUERY_KEYS.PAYMENTS_KEYS.LIST(),
    queryFn: async () => http.get<PaymentHistory>(ENDPOINTS.PAYMENTS.HISTORY),
    select: (data) => data.data,
    enabled: isAuthenticated,
  });
}
