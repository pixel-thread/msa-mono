import { useQuery } from '@tanstack/react-query';
import { consentEndpoints, ConsentQueryKeys } from '../utils/constants';
import { ConsentSummaryReport } from '../types';
import http from '@src/shared/utils/http';

export const useConsentReport = () => {
  return useQuery({
    queryKey: ConsentQueryKeys.report(),
    queryFn: () => http.get<ConsentSummaryReport[]>(consentEndpoints.report),
    select: (data) => data.data,
  });
};
