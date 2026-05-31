import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AssignTrainingInput } from '../types';
import { trainingEndpoints, TrainingQueryKeys } from '../utils/constants';
import { toast } from 'sonner-native';

type Props = {
  moduleId: string;
};

export const useAssignTraining = ({ moduleId }: Props) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AssignTrainingInput) =>
      http.post(trainingEndpoints.assign(moduleId), data),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: TrainingQueryKeys.assignments(moduleId) });
        return data;
      }
      toast.error(data.message);
      return data;
    },
  });
};