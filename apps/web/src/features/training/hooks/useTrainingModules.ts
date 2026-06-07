import { buildUrlWithQuery,ENDPOINTS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useQuery } from '@tanstack/react-query';

import type { TrainingModuleListItem } from '../types';
import { trainingQueryKeys } from '../utils/constants';

export function useTrainingModules(options: { page?: number; isActive?: boolean } = {}) {
  const { page = 1, isActive } = options;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: trainingQueryKeys.modules.list(page, isActive),
    queryFn: async () => {
      const url = buildUrlWithQuery(ENDPOINTS.TRAINING.MODULES, {
        page,
        ...(isActive !== undefined && { isActive }),
      });
      return http.get<TrainingModuleListItem[]>(url);
    },
  });

  return {
    modules: data?.data ?? [],
    meta: data?.meta,
    isLoading,
    error,
    refetch,
  };
}

export function useTrainingModule(moduleId: string | null) {
  const { data, isLoading, error } = useQuery({
    queryKey: trainingQueryKeys.modules.detail(moduleId),
    queryFn: async () =>
      http.get<TrainingModuleListItem>(ENDPOINTS.TRAINING.MODULE_DETAIL(moduleId!)),
    enabled: !!moduleId,
    select: (res) => res.data,
  });

  return {
    module: data,
    isLoading,
    error,
  };
}
