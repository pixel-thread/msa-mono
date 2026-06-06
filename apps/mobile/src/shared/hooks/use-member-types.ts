import { useQuery } from '@tanstack/react-query';
import http from '@utils/http';
import { MemberType } from '@sharedTypes/member';
import { QUERY_KEYS, ENDPOINTS } from '@repo/shared';

export function useMemberType() {
  return useQuery({
    queryKey: QUERY_KEYS.MEMBER_TYPES_KEYS.ALL(),
    queryFn: () => http.get<MemberType[]>(ENDPOINTS.MEMBER_TYPES.ROOT),
    select: (data) => data.data,
  });
}
