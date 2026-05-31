import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { complianceEndpoints, ComplianceQueryKeys } from '../utils/constants';
import { Compliance } from '../types/compliance.types';

export const useMyCompliance = () => {
  return useQuery({
    queryKey: ComplianceQueryKeys.my(),
    queryFn: () => http.get<Compliance[]>(complianceEndpoints.my),
    select: (data) => data.data,
  });
};
