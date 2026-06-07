import { QUERY_KEYS } from '@repo/shared';
import { buildUrlWithQuery,ENDPOINTS } from '@repo/shared';
import type { PaginationMeta } from '@src/shared/types/api.types';
import http from '@src/shared/utils/http';
import { useQuery } from '@tanstack/react-query';

import type { Announcement } from '../types';

export function useAnnouncementsList(status?: string, page: number = 1) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.ANNOUNCEMENTS_KEYS.LIST({ status, page }),
    queryFn: async () =>
      http.get<Announcement[]>(buildUrlWithQuery(ENDPOINTS.ANNOUNCEMENTS.ROOT, { page, status })),
  });

  return {
    announcements: data?.data ?? [],
    meta: data?.meta as PaginationMeta | undefined,
    isLoading,
    error,
    refetch,
  };
}
