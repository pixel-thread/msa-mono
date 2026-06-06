import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { QUERY_KEYS } from '@repo/shared';
import type { ComplianceEvidence } from '../types/compliance.types';
import type { ApiResponse } from '@src/shared/utils/http';
import { ENDPOINTS } from '@repo/shared';

export function useComplianceEvidence() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.COMPLIANCE_KEYS.EVIDENCE(),
    queryFn: async () => http.get<ComplianceEvidence>(ENDPOINTS.COMPLIANCE.EVIDENCE),
  });

  return {
    evidence: (data as ApiResponse<ComplianceEvidence>)?.data ?? null,
    isLoading,
    error,
    refetch,
  };
}
