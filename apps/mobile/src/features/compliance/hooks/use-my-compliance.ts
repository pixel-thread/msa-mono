import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { complianceEndpoints } from '../utils/constants';
import { QUERY_KEYS } from '@repo/shared';
import { Compliance } from '../types/compliance.types';

export const useMyCompliance = () => {
  return useQuery({
    queryKey: QUERY_KEYS.COMPLIANCE_KEYS.MY(),
    queryFn: () => http.get<Compliance[]>(complianceEndpoints.my),
    select: (data) => data.data,
  });
};
