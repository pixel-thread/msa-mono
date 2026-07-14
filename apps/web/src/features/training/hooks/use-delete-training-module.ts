import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useDeleteTrainingModule() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (moduleId: string) =>
      http.delete<{ success: boolean }>(ENDPOINTS.TRAINING.MODULE_DETAIL(moduleId)),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.TRAINING_KEYS.MODULES_LIST(),
        });
        toast.success('Training module deleted successfully');
        return res;
      }
      toast.error(res.message || 'Failed to delete module');
      return res;
    },
  });

  return {
    deleteModule: mutation.mutate,
    isDeleting: mutation.isPending,
  };
}
