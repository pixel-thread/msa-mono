import { useQuery } from '@tanstack/react-query';
import http from '@utils/http';
import { memberTypeEndpoints } from '@constants/endpoints';
import { MemberType } from '@sharedTypes/member';

export function useMemberType() {
  return useQuery({
    queryKey: ['member-types'],
    queryFn: () => http.get<MemberType[]>(memberTypeEndpoints.list),
    select: (data) => data.data,
  });
}
