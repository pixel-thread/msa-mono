import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useBulkRemoveTrainingAssignment(moduleId: string | null) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (userIds: string[]) =>
      http.patch(ENDPOINTS.TRAINING.MODULE_ASSIGN(moduleId!), { userIds }),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.TRAINING_KEYS.ASSIGNMENTS(moduleId),
        });
        toast.success('User assignments removed successfully');
        return res;
      }
      toast.error(res.message || 'Failed to remove assignments');
      return res;
    },
  });

  return {
    bulkRemoveUsers: mutation.mutate,
    isBulkRemoving: mutation.isPending,
  };
}
