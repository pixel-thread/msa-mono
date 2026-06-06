import { useQuery } from '@tanstack/react-query';
import { consentEndpoints } from '../utils/constants';
import { QUERY_KEYS } from '@repo/shared';
import { ConsentReceipt } from '../types';
import http from '@src/shared/utils/http';

export const useMyConsent = () => {
  return useQuery({
    queryKey: QUERY_KEYS.CONSENT_KEYS.MY(),
    queryFn: () => http.get<ConsentReceipt[]>(consentEndpoints.my),
    select: (data) => data.data,
  });
};
