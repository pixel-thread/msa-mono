import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import type { Declaration } from '../../types';
import { ENDPOINTS } from '@repo/shared';

export function useDeclarationDetail(id: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['declaration', id],
    queryFn: () => http.get<Declaration>(ENDPOINTS.CONTRIBUTION.DECLARATION(id)),
    enabled: !!id,
  });

  return {
    declaration: data?.data ?? null,
    isLoading,
    error,
  };
}
