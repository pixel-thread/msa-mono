import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { QUERY_KEYS } from '@repo/shared';
import type { ComplianceRecord } from '../types/compliance.types';
import type { ApiResponse } from '@src/shared/utils/http';
import { ENDPOINTS } from '@repo/shared';

export function useComplianceCheckDetail(checkId: string | null) {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.COMPLIANCE_KEYS.CHECK(checkId),
    queryFn: async () => http.get<ComplianceRecord>(ENDPOINTS.COMPLIANCE.CHECK_DETAIL(checkId!)),
    enabled: !!checkId,
  });

  return {
    check: ((data as ApiResponse<ComplianceRecord>)?.data as ComplianceRecord | null) ?? null,
    isLoading,
    error,
  };
}
