import { useQuery } from '@tanstack/react-query';
import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import { ConsentReceipt } from '../types';
import http from '@src/shared/utils/http';
import { useAuthStore } from '@src/shared/store';

export const useMyConsent = () => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: QUERY_KEYS.CONSENT_KEYS.MY(),
    queryFn: () => http.get<ConsentReceipt[]>(ENDPOINTS.CONSENT.MY),
    select: (data) => data.data,
    enabled: isAuthenticated,
  });
};
