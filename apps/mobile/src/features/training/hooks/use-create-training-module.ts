import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateTrainingModuleInput } from '../types';
import { QUERY_KEYS, ENDPOINTS } from '@repo/shared';
import { toast } from 'sonner-native';

export const useCreateTrainingModule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTrainingModuleInput) => http.post(ENDPOINTS.TRAINING.MODULES, data),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TRAINING_KEYS.MY_ALL() });
        return data;
      }
      toast.error(data.message);
      return data;
    },
  });
};
