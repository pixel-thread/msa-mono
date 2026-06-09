import { useQuery } from '@tanstack/react-query';
import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import http from '@src/shared/utils/http';
import type { Declaration } from '../types';

export const useDeclarations = () => {
  const query = useQuery({
    queryKey: QUERY_KEYS.CONTRIBUTIONS_KEYS.DECLARATIONS(),
    queryFn: async () => http.get<Declaration[]>(ENDPOINTS.CONTRIBUTION.DECLARATIONS),
  });

  return {
    ...query,
    data: query.data?.data ?? [],
    meta: query.data?.meta,
  };
};
