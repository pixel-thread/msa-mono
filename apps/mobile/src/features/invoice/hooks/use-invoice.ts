import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { Invoice } from '../types/invoice.types';

export const useInvoice = (id: string) => {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => http.get<Invoice>('/user/invoices/' + id),
    enabled: !!id,
    select: (data) => data.data,
  });
};
