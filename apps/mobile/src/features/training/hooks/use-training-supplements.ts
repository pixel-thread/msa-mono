import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import type { TrainingSupplement } from '../types';
import { useAuthStore } from '@src/shared/store';
import { trainingEndpoints, TrainingQueryKeys } from '../utils/constants';

export const useTrainingSupplements = (id: string) => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: TrainingQueryKeys.supplements(id),
    select: (data) => data?.data,
    queryFn: async () => http.get<TrainingSupplement[]>(trainingEndpoints.supplements(id)),
    enabled: isAuthenticated && id.length > 0,
  });
};
