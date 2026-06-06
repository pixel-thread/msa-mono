import { useMutation, useQueryClient } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { QUERY_KEYS } from '@repo/shared';
import { membersEndpoints } from '../utils/constants/endpoints';

export function useUpdateMemberAssociation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      memberId,
      associationId,
    }: {
      memberId: string;
      associationId: string;
    }) => {
      return http.patch(membersEndpoints.byId(memberId), { associationId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MEMBERS_KEYS.ALL() });
    },
  });
}
