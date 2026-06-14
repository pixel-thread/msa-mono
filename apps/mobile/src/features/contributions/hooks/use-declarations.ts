import { useQuery } from '@tanstack/react-query';
import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import http from '@src/shared/utils/http';
import type { Declaration } from '../types';
import { useAuthStore } from '@src/shared/store';

export const useDeclarations = () => {
  const { isAuthenticated } = useAuthStore();
  const query = useQuery({
    queryKey: QUERY_KEYS.CONTRIBUTIONS_KEYS.DECLARATIONS(),
    queryFn: () => http.get<Declaration[]>(ENDPOINTS.CONTRIBUTION.DECLARATIONS),
    enabled: isAuthenticated,
  });

  return {
    ...query,
    data: query.data?.data ?? [],
    meta: query.data?.meta,
  };
};
