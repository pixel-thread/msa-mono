import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { trainingEndpoints, TrainingQueryKeys } from '../utils/constants';
import { toast } from 'sonner-native';

type Props = {
  moduleId: string;
};

export const useRemoveTrainingAssignment = ({ moduleId }: Props) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { userId: string }) =>
      http.delete(trainingEndpoints.assign(moduleId), { data }),
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

export const useBulkRemoveTrainingAssignments = ({ moduleId }: Props) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { userIds: string[] }) =>
      http.patch(trainingEndpoints.assign(moduleId), data),
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