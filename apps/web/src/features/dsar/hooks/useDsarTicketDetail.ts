import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import type { DsarTicketRecord } from '../types';
import type { ApiResponse } from '@src/shared/utils/http';

export function useDsarTicketDetail(id: string | null) {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.DSAR_KEYS.TICKET(id),
    queryFn: async () => http.get<DsarTicketRecord>(ENDPOINTS.DSAR.DETAIL(id!)),
    enabled: !!id,
  });

  return {
    ticket: ((data as ApiResponse<DsarTicketRecord>)?.data as DsarTicketRecord) ?? null,
    isLoading,
    error,
  };
}
