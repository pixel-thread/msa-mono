import { QUERY_KEYS } from '@repo/shared';
import { ENDPOINTS } from '@repo/shared';
import type { ApiResponse } from '@src/shared/utils/http';
import http from '@src/shared/utils/http';
import { useQuery } from '@tanstack/react-query';

import type { ComplianceEvidence } from '../types/compliance.types';

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
