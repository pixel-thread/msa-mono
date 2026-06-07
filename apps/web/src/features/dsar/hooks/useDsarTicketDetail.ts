import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import type { ApiResponse } from '@src/shared/utils/http';
import http from '@src/shared/utils/http';
import { useQuery } from '@tanstack/react-query';

import type { DsarTicketRecord } from '../types';

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
