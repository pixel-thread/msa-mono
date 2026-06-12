import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS, ENDPOINTS } from '@repo/shared';
import { toast } from 'sonner-native';

type Props = {
  moduleId: string;
};

export const useRemoveTrainingAssignment = ({ moduleId }: Props) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { userId: string }) =>
      http.delete(ENDPOINTS.TRAINING.MODULE_ASSIGN(moduleId), { data }),
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

export const useBulkRemoveTrainingAssignments = ({ moduleId }: Props) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { userIds: string[] }) =>
      http.patch(ENDPOINTS.TRAINING.MODULE_ASSIGN(moduleId), data),
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
