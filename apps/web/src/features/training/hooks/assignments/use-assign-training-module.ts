import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useAssignTrainingModule(moduleId: string | null) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (userId: string) =>
      http.post(ENDPOINTS.TRAINING.MODULE_ASSIGN(moduleId!), { userId }),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.TRAINING_KEYS.ASSIGNMENTS(moduleId),
        });
        toast.success('User assigned successfully');
        return res;
      }
      toast.error(res.message || 'Failed to assign user');
      return res;
    },
  });

  return {
    assignUser: mutation.mutate,
    isAssigning: mutation.isPending,
  };
}
