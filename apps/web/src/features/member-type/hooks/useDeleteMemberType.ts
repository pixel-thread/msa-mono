import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useDeleteMemberType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => http.delete(ENDPOINTS.MEMBER_TYPES.DETAIL(id)),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Member type deleted successfully');
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MEMBER_TYPES_KEYS.LIST() });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MEMBER_TYPES_KEYS.ALL() });
        return;
      }
      toast.error(data.message);
    },
    onError: () => {
      toast.error('Failed to delete member type');
    },
  });
}
