import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import type { TrainingAssignmentWithUser } from '../types';
import { useAuthStore } from '@src/shared/store';
import { QUERY_KEYS, ENDPOINTS } from '@repo/shared';

export const useTrainingAssignments = (moduleId: string) => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: QUERY_KEYS.TRAINING_KEYS.ASSIGNMENTS(moduleId),
    select: (data) => data?.data,
    queryFn: async () =>
      http.get<TrainingAssignmentWithUser[]>(ENDPOINTS.TRAINING.MODULE_ASSIGN(moduleId)),
    enabled: isAuthenticated && !!moduleId,
  });
};