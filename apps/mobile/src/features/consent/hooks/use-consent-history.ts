import { useQuery } from '@tanstack/react-query';
import { consentEndpoints } from '../utils/constants';
import { QUERY_KEYS } from '@repo/shared';
import { ConsentReceiptRecord } from '../types';
import http from '@src/shared/utils/http';

export const useConsentHistory = () => {
  return useQuery({
    queryKey: QUERY_KEYS.CONSENT_KEYS.HISTORY(),
    queryFn: () => http.get<ConsentReceiptRecord[]>(consentEndpoints.history),
    select: (data) => data.data,
  });
};
