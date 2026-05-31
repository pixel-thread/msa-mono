import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateTrainingModuleInput } from '../types';
import { trainingEndpoints, TrainingQueryKeys } from '../utils/constants';
import { toast } from 'sonner-native';

export const useCreateTrainingModule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTrainingModuleInput) =>
      http.post(trainingEndpoints.modules, data),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: TrainingQueryKeys.all() });
        return data;
      }
      toast.error(data.message);
      return data;
    },
  });
};