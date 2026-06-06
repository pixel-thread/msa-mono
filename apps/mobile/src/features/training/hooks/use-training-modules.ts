import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import type { TrainingModule } from '../types';
import { useAuthStore } from '@src/shared/store';
import { trainingEndpoints } from '../utils/constants';
import { QUERY_KEYS } from '@repo/shared';

export const useTrainingModules = () => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: QUERY_KEYS.TRAINING_KEYS.MY_ALL(),
    select: (data) => data?.data,
    queryFn: async () => http.get<TrainingModule[]>(trainingEndpoints.modules),
    enabled: isAuthenticated,
  });
};
