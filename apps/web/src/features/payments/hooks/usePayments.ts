import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { ENDPOINTS, buildUrlWithQuery, QUERY_KEYS } from '@repo/shared';
import { PaymentTransaction } from '../types';

interface UsePaymentsOptions {
  page?: number;
  userId?: string;
  status?: string;
  method?: string;
  gateway?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export function usePayments(options: UsePaymentsOptions = {}) {
  const { page = 1, userId, status, method, gateway, search, startDate, endDate } = options;

  const queryParams: Record<string, string | number | boolean | null | undefined> = { page };
  if (userId) queryParams.userId = userId;
  if (status) queryParams.status = status;
  if (method) queryParams.method = method;
  if (gateway) queryParams.gateway = gateway;
  if (search) queryParams.search = search;
  if (startDate) queryParams.startDate = startDate;
  if (endDate) queryParams.endDate = endDate;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.PAYMENTS_KEYS.LIST(JSON.stringify(queryParams)),
    queryFn: () => http.get<PaymentTransaction[]>(buildUrlWithQuery(ENDPOINTS.PAYMENTS.LIST, queryParams)),
  });

  return {
    payments: data?.data ?? [],
    meta: data?.meta,
    isLoading,
    error,
    refetch,
  };
}
