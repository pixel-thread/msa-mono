import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import type { ApiResponse } from '@src/shared/utils/http';
import http from '@src/shared/utils/http';
import { useQuery } from '@tanstack/react-query';

interface SlaReport {
  breached: number;
  atRisk: number;
  onTrack: number;
}

export function useDsarSlaReport() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.DSAR_KEYS.SLA(),
    queryFn: async () => http.get<SlaReport>(ENDPOINTS.DSAR.SLA_REPORT),
  });

  return {
    report: ((data as ApiResponse<SlaReport>)?.data as SlaReport) ?? null,
    isLoading,
    error,
    refetch,
  };
}
