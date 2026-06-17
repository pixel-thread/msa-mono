import { useInfiniteQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import type { TrainingCompletionWithModule } from '../types';
import { useAuthStore } from '@src/shared/store';
import { QUERY_KEYS, ENDPOINTS, buildUrlWithQuery } from '@repo/shared';

export const useMyTrainingCompletions = () => {
  const { isAuthenticated } = useAuthStore();

  return useInfiniteQuery({
    queryKey: QUERY_KEYS.TRAINING_KEYS.COMPLETIONS_MY(),
    queryFn: ({ pageParam }) =>
      http.get<TrainingCompletionWithModule[]>(
        buildUrlWithQuery(ENDPOINTS.TRAINING.MY_COMPLETIONS, { page: pageParam })
      ),
    initialPageParam: 1,

    enabled: isAuthenticated,

    getNextPageParam: (nextPage) => {
      if (!nextPage.meta?.hasMore) {
        return undefined;
      }

      return nextPage.meta.page + 1;
    },

    getPreviousPageParam: (prev) => {
      if (!prev.meta || prev.meta.page <= 1) {
        return undefined;
      }

      return prev.meta.page - 1;
    },
    select: (res) => {
      return res.pages.flatMap((page) => page.data ?? []);
    },
  });
};
