import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { QUERY_KEYS } from '@repo/shared';
import { membersEndpoints } from '../utils/constants/endpoints';

interface MemberType {
  id: string;
  level: number;
  description: string | null;
}

export function useMemberTypes() {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.MEMBERS_KEYS.TYPES(),
    queryFn: async () => http.get<MemberType[]>(membersEndpoints.types),
    select: (data) => data.data,
  });

  return {
    memberTypes: data ?? [],
    isLoading,
    error,
  };
}
