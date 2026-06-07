import { QUERY_KEYS } from '@repo/shared';
import { ENDPOINTS } from '@repo/shared';
import type { ApiResponse } from '@src/shared/utils/http';
import http from '@src/shared/utils/http';
import { useQuery } from '@tanstack/react-query';

import type { ConsentSummaryReport } from '../types/consent.types';

export function useConsentReport() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.CONSENT_KEYS.REPORT(),
    queryFn: async () => http.get<ConsentSummaryReport[]>(ENDPOINTS.CONSENT.REPORT),
  });

  return {
    report: ((data as ApiResponse<ConsentSummaryReport[]>)?.data as ConsentSummaryReport[]) ?? [],
    isLoading,
    error,
    refetch,
  };
}
