import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import type { Declaration } from '../../types';
import { buildUrlWithQuery, ENDPOINTS, QUERY_KEYS } from '@repo/shared';

interface UseDeclarationsOptions {
  page?: number;
  status?: string;
  search?: string;
}

export function useDeclarations(options: UseDeclarationsOptions = {}) {
  const { page = 1, status, search } = options;

  const url = buildUrlWithQuery(ENDPOINTS.CONTRIBUTION.DECLARATIONS, {
    page,
    status,
    search,
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.CONTRIBUTIONS_KEYS.DECLARATIONS(page, status, search),
    queryFn: () => http.get<Declaration[]>(url),
  });

  return {
    declarations: data?.data ?? [],
    meta: data?.meta,
    isLoading,
    error,
    refetch,
  };
}
