import { useMutation, useQueryClient } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { toast } from 'sonner';
import { ENDPOINTS } from '@repo/shared';
import { trainingQueryKeys } from '../../utils/constants';

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
          queryKey: trainingQueryKeys.assignments.all(moduleId),
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
