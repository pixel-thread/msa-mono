import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UpdateTrainingModuleInput } from '../types';
import { QUERY_KEYS, ENDPOINTS } from '@repo/shared';
import { toast } from 'sonner-native';

type Props = {
  moduleId: string;
};

export const useUpdateTrainingModule = ({ moduleId }: Props) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateTrainingModuleInput) =>
      http.patch(ENDPOINTS.TRAINING.MODULE_DETAIL(moduleId), data),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TRAINING_KEYS.MY_ALL() });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.TRAINING_KEYS.MODULE_DETAIL(moduleId),
        });
        return data;
      }
      toast.error(data.message);
      return data;
    },
  });
};
