import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useMutation } from '@tanstack/react-query';

import type { RetroactiveAdjustmentRecord } from '../types/retro-active';

interface RetroactiveAffectedUsersFilters {
  planVersionId?: string;
  startDate?: string;
  endDate?: string;
}

export function useRetroactiveAffectedUsers() {
  const { data, isPending, error, mutate } = useMutation({
    mutationKey: QUERY_KEYS.CONTRIBUTIONS_KEYS.RETROACTIVE_USERS(),
    mutationFn: (filters: RetroactiveAffectedUsersFilters) => {
      const body: Record<string, string> = {};
      if (filters.planVersionId) body.planVersionId = filters.planVersionId;
      if (filters.startDate) body.startDate = filters.startDate;
      if (filters.endDate) body.endDate = filters.endDate;
      return http.post<RetroactiveAdjustmentRecord[]>(
        ENDPOINTS.CONTRIBUTION.RETROACTIVE_USERS,
        body,
      );
    },
  });

  return {
    records: data?.data ?? [],
    isPending,
    error,
    search: mutate,
  };
}
