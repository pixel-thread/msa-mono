import { buildUrlWithQuery, ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useQuery } from '@tanstack/react-query';

import type { TrainingModuleListItem } from '../types';

export function useTrainingModules(
  options: { search?: string } = { search: '' },
  page: number = 1,
) {
  const { search } = options;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.TRAINING_KEYS.MODULES_LIST(search, page),
    queryFn: async () => {
      const url = buildUrlWithQuery(ENDPOINTS.TRAINING.MODULES, {
        page,
        search,
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
    queryKey: QUERY_KEYS.TRAINING_KEYS.MODULE_DETAIL(moduleId || ''),
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
