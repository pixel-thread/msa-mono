import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { ComplianceDetail } from '../types/compliance.types';
import { complianceEndpoints, ComplianceQueryKeys } from '../utils/constants';

export const useMyComplianceDetail = (id: string) => {
  return useQuery({
    queryKey: ComplianceQueryKeys.myDetail(id),
    queryFn: () => http.get<ComplianceDetail>(complianceEndpoints.myDetail(id)),
    select: (data) => data.data,
    enabled: !!id,
  });
};
