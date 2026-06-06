import { useQuery } from '@tanstack/react-query';
import { consentEndpoints } from '../utils/constants';
import { QUERY_KEYS } from '@repo/shared';
import { ConsentSummaryReport } from '../types';
import http from '@src/shared/utils/http';

export const useConsentReport = () => {
  return useQuery({
    queryKey: QUERY_KEYS.CONSENT_KEYS.REPORT(),
    queryFn: () => http.get<ConsentSummaryReport[]>(consentEndpoints.report),
    select: (data) => data.data,
  });
};
