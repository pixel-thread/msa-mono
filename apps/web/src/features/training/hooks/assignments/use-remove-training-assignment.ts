import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useRemoveTrainingAssignment(moduleId: string | null) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (userId: string) =>
      http.delete(ENDPOINTS.TRAINING.MODULE_ASSIGN(moduleId!), {
        data: { userId },
      }),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.TRAINING_KEYS.ASSIGNMENTS(moduleId),
        });
        toast.success('User assignment removed successfully');
        return res;
      }
      toast.error(res.message || 'Failed to remove assignment');
      return res;
    },
  });

  return {
    removeUser: mutation.mutate,
    isRemoving: mutation.isPending,
  };
}
