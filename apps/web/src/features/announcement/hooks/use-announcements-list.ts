import { QUERY_KEYS } from '@repo/shared';
import { buildUrlWithQuery, ENDPOINTS } from '@repo/shared';
import type { PaginationMeta } from '@src/shared/types/api.types';
import http from '@src/shared/utils/http';
import { useQuery } from '@tanstack/react-query';

import type { Announcement } from '../types';

type FilterOptions = {
  search?: string;
  status?: string;
  priority?: string;
};

type UseAnnouncementsList = {
  options: FilterOptions;
  page?: number;
};

export function useAnnouncementsList({ options, page = 1 }: UseAnnouncementsList) {
  const { search = '', status = 'PUBLISHED', priority = 'NORMAL' } = options;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.ANNOUNCEMENTS_KEYS.LIST(search, status, priority, page.toString()),
    queryFn: async () =>
      http.get<Announcement[]>(
        buildUrlWithQuery(ENDPOINTS.ANNOUNCEMENTS.LIST, { search, status, priority, page }),
      ),
  });

  return {
    announcements: data?.data ?? [],
    meta: data?.meta as PaginationMeta | undefined,
    isLoading,
    error,
    refetch,
  };
}
