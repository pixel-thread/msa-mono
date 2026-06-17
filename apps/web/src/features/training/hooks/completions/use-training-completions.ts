'use client';

import { buildUrlWithQuery, ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useQuery } from '@tanstack/react-query';

import type { TrainingCompletionItem } from '../../types';

export function useTrainingCompletions(moduleId: string | null, options: { page?: number } = {}) {
  const { page = 1 } = options;

  const url = !!moduleId
    ? buildUrlWithQuery(ENDPOINTS.TRAINING.MODULE_COMPLETE(moduleId), { page })
    : buildUrlWithQuery(ENDPOINTS.TRAINING.COMPLETIONS, { page });

  const queryKey = !!moduleId
    ? [...QUERY_KEYS.TRAINING_KEYS.COMPLETIONS_BY_MODULE(moduleId, page), url]
    : [...QUERY_KEYS.TRAINING_KEYS.COMPLETIONS_ADMIN_LIST(page), url];

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
