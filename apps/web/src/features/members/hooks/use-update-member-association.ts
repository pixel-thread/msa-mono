import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';

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
      return http.patch(ENDPOINTS.MEMBERS.DETAILS(memberId), { associationId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MEMBERS_KEYS.ALL() });
    },
  });
}
