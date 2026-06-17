import { QUERY_KEYS } from '@repo/shared';
import { ENDPOINTS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useQuery } from '@tanstack/react-query';

import { Association } from '../types/association';

export function useAssociationsList() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.ASSOCIATIONS_KEYS.LIST(),
    queryFn: async () => http.get<Association[]>(ENDPOINTS.ADMIN.ASSOCIATIONS),
  });

  return {
    associations: data?.data ?? [],
    meta: data?.meta,
    isLoading,
    error,
    refetch,
  };
}
