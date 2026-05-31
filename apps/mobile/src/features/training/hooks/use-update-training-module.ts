import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UpdateTrainingModuleInput } from '../types';
import { trainingEndpoints, TrainingQueryKeys } from '../utils/constants';
import { toast } from 'sonner-native';

type Props = {
  moduleId: string;
};

export const useUpdateTrainingModule = ({ moduleId }: Props) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateTrainingModuleInput) =>
      http.patch(trainingEndpoints.getModule(moduleId), data),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: TrainingQueryKeys.all() });
        queryClient.invalidateQueries({ queryKey: TrainingQueryKeys.detail(moduleId) });
        return data;
      }
      toast.error(data.message);
      return data;
    },
  });
};