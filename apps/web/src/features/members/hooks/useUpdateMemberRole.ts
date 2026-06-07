import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      memberId,
      role,
      action,
    }: {
      memberId: string;
      role: string;
      action: 'add' | 'remove';
    }) => {
      if (action === 'add') {
        return http.post(ENDPOINTS.MEMBERS.ROLE(memberId), { role });
      }
      return http.put(ENDPOINTS.MEMBERS.ROLE(memberId), { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MEMBERS_KEYS.ALL() });
    },
  });
}
