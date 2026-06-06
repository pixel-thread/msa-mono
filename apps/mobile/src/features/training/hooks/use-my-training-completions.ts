import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import type { TrainingCompletionWithModule } from '../types';
import { useAuthStore } from '@src/shared/store';
import { trainingEndpoints } from '../utils/constants';
import { QUERY_KEYS } from '@repo/shared';

export const useMyTrainingCompletions = () => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: QUERY_KEYS.TRAINING_KEYS.COMPLETIONS_MY(),
    select: (data) => data?.data,
    queryFn: async () =>
      http.get<TrainingCompletionWithModule[]>(trainingEndpoints.myCompletions),
    enabled: isAuthenticated,
  });
};