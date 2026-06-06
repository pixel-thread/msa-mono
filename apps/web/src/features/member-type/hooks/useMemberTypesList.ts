import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { QUERY_KEYS } from '@repo/shared';
import { memberTypeEndpoints } from '../utils/constants/endpoints';

interface MemberType {
  id: string;
  level: number;
  description: string | null;
  _count: {
    users: number;
    subscriptionPlans: number;
  };
}

export function useMemberTypesList() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.MEMBER_TYPES_KEYS.LIST(),
    queryFn: async () => http.get<MemberType[]>(memberTypeEndpoints.base),
    select: (data) => data.data,
  });

  return {
    memberTypes: data ?? [],
    isLoading,
    error,
    refetch,
  };
}
