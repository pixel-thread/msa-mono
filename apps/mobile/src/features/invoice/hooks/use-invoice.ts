import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { Invoice } from '../types/invoice.types';
import { QUERY_KEYS } from '@repo/shared';

export const useInvoice = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.INVOICE_KEYS.DETAIL(id),
    queryFn: () => http.get<Invoice>('/user/invoices/' + id),
    enabled: !!id,
    select: (data) => data.data,
  });
};
