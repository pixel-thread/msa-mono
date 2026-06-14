import { useQuery } from '@tanstack/react-query';
import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import { ConsentReceiptRecord } from '../types';
import http from '@src/shared/utils/http';
import { useAuthStore } from '@src/shared/store';

export const useConsentHistory = () => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: QUERY_KEYS.CONSENT_KEYS.HISTORY(),
    queryFn: () => http.get<ConsentReceiptRecord[]>(ENDPOINTS.CONSENT.HISTORY),
    select: (data) => data.data,
    enabled: isAuthenticated,
  });
};
