import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CompleteTrainingInput } from '../types';
import { QUERY_KEYS, ENDPOINTS } from '@repo/shared';
import { toast } from 'sonner-native';

type Props = {
  moduleId: string;
};

export const useCompleteTraining = ({ moduleId }: Props) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data?: CompleteTrainingInput) =>
      http.post(ENDPOINTS.TRAINING.MODULE_COMPLETE(moduleId), data),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TRAINING_KEYS.COMPLETIONS_MY() });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.TRAINING_KEYS.COMPLETIONS_ADMIN_LIST(),
        });
        return data;
      }
      toast.error(data.message);
      return data;
    },
  });
};
