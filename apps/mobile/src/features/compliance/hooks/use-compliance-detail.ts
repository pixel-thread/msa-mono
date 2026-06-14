import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { ComplianceDetail } from '../types/compliance.types';
import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import { useAuthStore } from '@src/shared/store';

export const useMyComplianceDetail = (id: string) => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: QUERY_KEYS.COMPLIANCE_KEYS.MY_DETAIL(id),
    queryFn: () => http.get<ComplianceDetail>(ENDPOINTS.COMPLIANCE.MY_DETAIL(id)),
    select: (data) => data.data,
    enabled: !!id && isAuthenticated,
  });
};
