import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import type { Declaration } from '../../types';
import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';

export function useDeclarationDetail(id: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.CONTRIBUTIONS_KEYS.DECLARATION(id),
    queryFn: () => http.get<Declaration>(ENDPOINTS.CONTRIBUTION.DECLARATION(id)),
    enabled: !!id,
  });

  return {
    declaration: data?.data ?? null,
    isLoading,
    error,
  };
}
