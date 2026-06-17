import { ENDPOINTS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useQuery } from '@tanstack/react-query';

import { TrainingCertificateItem } from '../../types';
import { trainingQueryKeys } from '../../utils/constants';

export function useTrainingCertificates(moduleId: string | null) {
  const query = useQuery({
    queryKey: trainingQueryKeys.certificates.all(moduleId),
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
