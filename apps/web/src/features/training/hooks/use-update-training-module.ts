import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type { TrainingModuleListItem } from '../types';
import type { UpdateTrainingModuleInput } from '../validators/training';

export function useUpdateTrainingModule() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ moduleId, data }: { moduleId: string; data: UpdateTrainingModuleInput }) =>
      http.patch<TrainingModuleListItem>(ENDPOINTS.TRAINING.MODULE_DETAIL(moduleId), data),
    onSuccess: (res, variables) => {
      if (res.success) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.TRAINING_KEYS.MODULES_LIST(),
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.TRAINING_KEYS.MODULE_DETAIL(variables.moduleId),
        });
        toast.success('Training module updated successfully');
        return res;
      }
      toast.error(res.message || 'Failed to update module');
      return res;
    },
  });

  return {
    updateModule: mutation.mutate,
    isUpdating: mutation.isPending,
  };
}
