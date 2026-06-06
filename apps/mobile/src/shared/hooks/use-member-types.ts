import { useQuery } from '@tanstack/react-query';
import http from '@utils/http';
import { memberTypeEndpoints } from '@constants/endpoints';
import { MemberType } from '@sharedTypes/member';
import { QUERY_KEYS } from '@repo/shared';

export function useMemberType() {
  return useQuery({
    queryKey: QUERY_KEYS.MEMBER_TYPES_KEYS.ALL(),
    queryFn: () => http.get<MemberType[]>(memberTypeEndpoints.list),
    select: (data) => data.data,
  });
}
