import { useMutation, useQueryClient } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { QUERY_KEYS } from '@repo/shared';
import { membersEndpoints } from '../utils/constants/endpoints';

export function useUpdateMemberStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, status }: { memberId: string; status: string }) => {
      return http.patch(membersEndpoints.status(memberId), { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MEMBERS_KEYS.ALL() });
    },
  });
}
