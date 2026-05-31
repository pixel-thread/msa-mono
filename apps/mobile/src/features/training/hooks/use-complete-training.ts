import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CompleteTrainingInput } from '../types';
import { trainingEndpoints, TrainingQueryKeys } from '../utils/constants';
import { toast } from 'sonner-native';

type Props = {
  moduleId: string;
};

export const useCompleteTraining = ({ moduleId }: Props) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data?: CompleteTrainingInput) =>
      http.post(trainingEndpoints.complete(moduleId), data),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: TrainingQueryKeys.myCompletions() });
        queryClient.invalidateQueries({ queryKey: TrainingQueryKeys.allCompletions() });
        return data;
      }
      toast.error(data.message);
      return data;
    },
  });
};

