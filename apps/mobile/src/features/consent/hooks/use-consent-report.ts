import { useQuery } from '@tanstack/react-query';
import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import { ConsentSummaryReport } from '../types';
import http from '@src/shared/utils/http';

export const useConsentReport = () => {
  return useQuery({
    queryKey: QUERY_KEYS.CONSENT_KEYS.REPORT(),
    queryFn: () => http.get<ConsentSummaryReport[]>(ENDPOINTS.CONSENT.REPORT),
    select: (data) => data.data,
  });
};
