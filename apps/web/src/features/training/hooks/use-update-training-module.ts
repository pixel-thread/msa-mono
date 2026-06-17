import { ENDPOINTS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type { TrainingModuleListItem } from '../types';
import { trainingQueryKeys } from '../utils/constants';
import type { UpdateTrainingModuleInput } from '../validators/training';

export function useUpdateTrainingModule() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ moduleId, data }: { moduleId: string; data: UpdateTrainingModuleInput }) =>
      http.patch<TrainingModuleListItem>(ENDPOINTS.TRAINING.MODULE_DETAIL(moduleId), data),
    onSuccess: (res, variables) => {
      if (res.success) {
        queryClient.invalidateQueries({
          queryKey: trainingQueryKeys.modules.all(),
        });
        queryClient.invalidateQueries({
          queryKey: trainingQueryKeys.modules.detail(variables.moduleId),
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
