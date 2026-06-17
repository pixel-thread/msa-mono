import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useQuery } from '@tanstack/react-query';

interface MemberType {
  id: string;
  level: number;
  description: string | null;
}

export function useMemberTypes() {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.MEMBERS_KEYS.TYPES(),
    queryFn: async () => http.get<MemberType[]>(ENDPOINTS.MEMBER_TYPES.ROOT),
    select: (data) => data.data,
  });

  return {
    memberTypes: data ?? [],
    isLoading,
    error,
  };
}
