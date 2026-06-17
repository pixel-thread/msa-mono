import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useQuery } from '@tanstack/react-query';

interface MemberType {
  id: string;
  level: number;
  description: string | null;
  _count: {
    users: number;
    plans: number;
  };
}

export function useMemberTypesList() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.MEMBER_TYPES_KEYS.LIST(),
    queryFn: async () => http.get<MemberType[]>(ENDPOINTS.MEMBER_TYPES.ROOT),
    select: (data) => data.data,
  });

  return {
    memberTypes: data ?? [],
    isLoading,
    error,
    refetch,
  };
}
