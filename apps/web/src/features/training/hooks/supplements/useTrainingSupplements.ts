import { buildUrlWithQuery,ENDPOINTS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useQuery } from '@tanstack/react-query';

import { TrainingSupplementItem } from '../../types';
import { trainingQueryKeys } from '../../utils/constants';

export function useTrainingSupplements(moduleId: string, page?: number) {
  const pageNo = page ?? 1;
  const query = useQuery({
    queryKey: trainingQueryKeys.supplements.all(moduleId, pageNo),
    queryFn: async () =>
      http.get<TrainingSupplementItem[]>(
        buildUrlWithQuery(ENDPOINTS.TRAINING.MODULE_SUPPLEMENTS(moduleId), { page: pageNo }),
      ),
  });

  const data = query?.data?.data;
  const meta = query?.data?.meta;
  return {
    ...query,
    data: data,
    meta: meta,
  };
}
