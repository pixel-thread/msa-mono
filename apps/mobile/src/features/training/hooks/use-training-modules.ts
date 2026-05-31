import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import type { TrainingModule } from '../types';
import { useAuthStore } from '@src/shared/store';
import { trainingEndpoints, TrainingQueryKeys } from '../utils/constants';

export const useTrainingModules = () => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: TrainingQueryKeys.all(),
    select: (data) => data?.data,
    queryFn: async () => http.get<TrainingModule[]>(trainingEndpoints.modules),
    enabled: isAuthenticated,
  });
};
