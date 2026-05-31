import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import type { TrainingCompletionWithModule } from '../types';
import { useAuthStore } from '@src/shared/store';
import { trainingEndpoints, TrainingQueryKeys } from '../utils/constants';

export const useMyTrainingCompletions = () => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: TrainingQueryKeys.myCompletions(),
    select: (data) => data?.data,
    queryFn: async () =>
      http.get<TrainingCompletionWithModule[]>(trainingEndpoints.myCompletions),
    enabled: isAuthenticated,
  });
};