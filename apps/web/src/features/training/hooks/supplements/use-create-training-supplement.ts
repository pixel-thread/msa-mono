import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useCreateTrainingSupplement(moduleId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) =>
      http.post(ENDPOINTS.TRAINING.MODULE_SUPPLEMENTS(moduleId!), formData),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.TRAINING_KEYS.SUPPLEMENTS(moduleId),
        });
        toast.success(res.message);
        return res;
      }
      toast.error(res.message || 'Failed to add supplement');
      return res;
    },
  });
}
