import { useQuery } from '@tanstack/react-query';
import { consentEndpoints, ConsentQueryKeys } from '../utils/constants';
import { ConsentReceiptRecord } from '../types';
import http from '@src/shared/utils/http';

export const useConsentHistory = () => {
  return useQuery({
    queryKey: ConsentQueryKeys.history(),
    queryFn: () => http.get<ConsentReceiptRecord[]>(consentEndpoints.history),
    select: (data) => data.data,
  });
};
