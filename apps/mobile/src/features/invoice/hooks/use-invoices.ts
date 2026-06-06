import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { Invoice } from '../types/invoice.types';
import { useAuthStore } from '@src/shared/store';
import { QUERY_KEYS } from '@repo/shared';

type UseInvoiceProps = {
  page?: number;
};

export function useInvoices({ page = 1 }: UseInvoiceProps = {}) {
  const { isAuthenticated } = useAuthStore();
  const query = useQuery({
    queryKey: QUERY_KEYS.INVOICE_KEYS.LIST(page),
    queryFn: () => http.get<Invoice[]>('/user/invoices'),
    enabled: !isAuthenticated,
  });

  const meta = query?.data?.meta;
  const data = query?.data?.data;

  return {
    data,
    meta,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
  };
}
