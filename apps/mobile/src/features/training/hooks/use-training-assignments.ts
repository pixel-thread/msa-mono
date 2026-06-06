import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import type { TrainingAssignmentWithUser } from '../types';
import { useAuthStore } from '@src/shared/store';
import { trainingEndpoints } from '../utils/constants';
import { QUERY_KEYS } from '@repo/shared';

export const useTrainingAssignments = (moduleId: string) => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: QUERY_KEYS.TRAINING_KEYS.ASSIGNMENTS(moduleId),
    select: (data) => data?.data,
    queryFn: async () =>
      http.get<TrainingAssignmentWithUser[]>(trainingEndpoints.assign(moduleId)),
    enabled: isAuthenticated && !!moduleId,
  });
};