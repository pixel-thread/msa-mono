import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type ChangeMemberTypeData = {
  memberId: string;
  memberTypeId: string;
};
export function useChangeMemberType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ChangeMemberTypeData) =>
      http.post(ENDPOINTS.MEMBERS.MEMBER_TYPE(data.memberId), { memberTypeId: data.memberTypeId }),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.MEMBERS_KEYS.ALL(),
        });
      }
    },
  });
}
