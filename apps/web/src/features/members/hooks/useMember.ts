'use client';
import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import type { User } from '@src/shared/types';
import http from '@src/shared/utils/http';
import { useQuery } from '@tanstack/react-query';

export function useMember(memberId: string) {
  const {
    data,
    isLoading: isLo,
    isFetching,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.MEMBERS_KEYS.DETAIL(memberId),
    queryFn: () => http.get<User>(ENDPOINTS.MEMBERS.DETAILS(memberId)),
    enabled: !!memberId,
    select: (data) => data.data,
  });

  return {
    member: data,
    isLoading: isFetching || isLo,
    error,
  };
}
