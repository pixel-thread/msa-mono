import { useMutation, useQueryClient } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { QUERY_KEYS } from '@repo/shared';
import { toast } from 'sonner';
import { memberTypeEndpoints } from '../utils/constants/endpoints';

export function useDeleteMemberType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => http.delete(memberTypeEndpoints.byId(id)),
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
