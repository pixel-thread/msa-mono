import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type { UpdateMemberTypeInput } from '../validators';

export function useUpdateMemberType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMemberTypeInput }) =>
      http.patch(ENDPOINTS.MEMBER_TYPES.DETAIL(id), data),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Member type updated successfully');
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MEMBER_TYPES_KEYS.LIST() });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MEMBER_TYPES_KEYS.ALL() });
        return;
      }
      toast.error(data.message);
    },
    onError: () => {
      toast.error('Failed to update member type');
    },
  });
}
