import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { trainingEndpoints } from '../utils/constants';
import { QUERY_KEYS } from '@repo/shared';
import { toast } from 'sonner-native';

type BulkAssignInput = {
  userIds: string[];
};

type Props = {
  moduleId: string;
};

export const useBulkAssignTraining = ({ moduleId }: Props) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkAssignInput) =>
      http.put(trainingEndpoints.assign(moduleId), data),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TRAINING_KEYS.ASSIGNMENTS(moduleId) });
        return data;
      }
      toast.error(data.message);
      return data;
    },
  });
};