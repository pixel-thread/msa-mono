import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { ComplianceDetail } from '../types/compliance.types';
import { complianceEndpoints } from '../utils/constants';
import { QUERY_KEYS } from '@repo/shared';

export const useMyComplianceDetail = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.COMPLIANCE_KEYS.MY_DETAIL(id),
    queryFn: () => http.get<ComplianceDetail>(complianceEndpoints.myDetail(id)),
    select: (data) => data.data,
    enabled: !!id,
  });
};
