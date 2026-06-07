import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useQuery } from '@tanstack/react-query';

import type { Declaration } from '../../types';

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
