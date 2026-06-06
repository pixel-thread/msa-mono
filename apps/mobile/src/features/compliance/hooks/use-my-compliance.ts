import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import { Compliance } from '../types/compliance.types';

export const useMyCompliance = () => {
  return useQuery({
    queryKey: QUERY_KEYS.COMPLIANCE_KEYS.MY(),
    queryFn: () => http.get<Compliance[]>(ENDPOINTS.COMPLIANCE.MY_LIST),
    select: (data) => data.data,
  });
};
