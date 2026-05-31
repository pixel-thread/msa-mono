import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import type { TrainingModule } from '../types';
import { useAuthStore } from '@src/shared/store';
import { trainingEndpoints, TrainingQueryKeys } from '../utils/constants';

export const useTrainingModule = (id: string) => {
  const { isAuthenticated } = useAuthStore();
  
  return useQuery({
    queryKey: TrainingQueryKeys.detail(id),
    select: (data) => data?.data,
    queryFn: async () => http.get<TrainingModule>(trainingEndpoints.getModule(id)),
    enabled: isAuthenticated && id.length > 0,
    staleTime: 5 * 60 * 1000,
  });
};