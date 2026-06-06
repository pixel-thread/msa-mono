import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { ENDPOINTS, QUERY_KEYS, buildUrlWithQuery } from '@repo/shared';
import type { User, UserStatus } from '@src/shared/types';

interface UseMembersOptions {
  page?: number;
  status?: UserStatus;
}

export function useMembers(options: UseMembersOptions = {}) {
  const { page = 1, status = 'ACTIVE' } = options;

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: QUERY_KEYS.MEMBERS_KEYS.LIST(page, status),
    queryFn: () => http.get<User[]>(buildUrlWithQuery(ENDPOINTS.MEMBERS.ROOT, { page, status })),
  });

  return {
    members: data?.data ?? [],
    meta: data?.meta,
    isLoading: isFetching || isLoading,
    error,
    refetch,
  };
}
