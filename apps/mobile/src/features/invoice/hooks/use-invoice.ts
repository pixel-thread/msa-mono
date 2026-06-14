import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { Invoice } from '../types/invoice.types';
import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import { useAuthStore } from '@src/shared/store';

export const useInvoice = (id: string) => {
  const { isAuthenticated } = useAuthStore();
  const url = ENDPOINTS.USER.INVOICE_DETAILS(id);
  return useQuery({
    queryKey: QUERY_KEYS.INVOICE_KEYS.DETAIL(id),
    queryFn: () => http.get<Invoice>(url),
    enabled: !!id && isAuthenticated,
    select: (data) => data.data,
  });
};
