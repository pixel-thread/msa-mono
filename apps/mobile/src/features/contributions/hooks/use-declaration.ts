import { useQuery } from '@tanstack/react-query';
import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useAuthStore } from '@src/shared/store';
import { Declaration } from '../types';

export const useDeclaration = (id: string) => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryFn: () => http.post<Declaration>(ENDPOINTS.CONTRIBUTION.DECLARATION(id)),
    queryKey: QUERY_KEYS.CONTRIBUTIONS_KEYS.DECLARATION(id),
    enabled: !!id && isAuthenticated,
    select: (data) => data.data,
  });
};
