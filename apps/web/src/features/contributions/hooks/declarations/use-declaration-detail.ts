import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useQuery } from '@tanstack/react-query';

import type { Declaration } from '../../types';

export function useDeclarationDetail(id: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.DECLARATIONS_KEYS.DETAIL(id),
    queryFn: () => http.get<Declaration>(ENDPOINTS.DECLARATION.DETAIL(id)),
    enabled: !!id,
  });

  return {
    declaration: data?.data ?? null,
    isLoading,
    error,
  };
}
