import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { Invoice } from '../types/invoice.types';
import { useAuthStore } from '@src/shared/store';

type UseInvoiceProps = {
  page?: number;
};

export function useInvoices({ page = 1 }: UseInvoiceProps = {}) {
  const { isAuthenticated } = useAuthStore();
  const query = useQuery({
    queryKey: ['invoices', page],
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
