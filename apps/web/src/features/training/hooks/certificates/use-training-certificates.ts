import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useQuery } from '@tanstack/react-query';

import { TrainingCertificateItem } from '../../types';

export function useTrainingCertificates(moduleId: string | null) {
  const query = useQuery({
    queryKey: QUERY_KEYS.TRAINING_KEYS.CERTIFICATES(moduleId),
    queryFn: async () =>
      http.get<TrainingCertificateItem[]>(ENDPOINTS.TRAINING.MODULE_CERTIFICATES(moduleId!)),
    enabled: !!moduleId,
  });

  return {
    certificates: query.data?.data ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
