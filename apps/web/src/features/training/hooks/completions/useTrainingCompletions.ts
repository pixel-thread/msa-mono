'use client';

import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { ENDPOINTS, buildUrlWithQuery } from '@repo/shared';
import { trainingQueryKeys } from '../../utils/constants';
import type { TrainingCompletionItem } from '../../types';

export function useTrainingCompletions(moduleId: string | null, options: { page?: number } = {}) {
  const { page = 1 } = options;

  const url = !!moduleId
    ? buildUrlWithQuery(ENDPOINTS.TRAINING.MODULE_COMPLETE(moduleId), { page })
    : buildUrlWithQuery(ENDPOINTS.TRAINING.COMPLETIONS, { page });

  const queryKey = !!moduleId
    ? trainingQueryKeys.completions.byModule(moduleId, page)
    : trainingQueryKeys.completions.adminList(page);

  const query = useQuery({
    queryKey: queryKey,
    queryFn: () => http.get<TrainingCompletionItem[]>(url),
  });

  const data = query.data?.data;
  const meta = query.data?.meta;

  return {
    completions: data ?? [],
    meta: meta,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
