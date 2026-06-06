import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { QUERY_KEYS } from '@repo/shared';
import type { ConsentSummaryReport } from '../types/consent.types';
import type { ApiResponse } from '@src/shared/utils/http';
import { ENDPOINTS } from '@repo/shared';

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
