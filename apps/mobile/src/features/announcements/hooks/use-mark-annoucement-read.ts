import http from '@src/shared/utils/http';
import { useQuery } from '@tanstack/react-query';
import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import { useAuthStore } from '@src/shared/store';

export function useMarkAnnouncementRead(id: string) {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: QUERY_KEYS.ANNOUNCEMENTS_KEYS.DETAILS(id),
    queryFn: () => http.post<{ id: string }>(ENDPOINTS.ANNOUNCEMENTS.READ(id)),
    enabled: isAuthenticated,
  });
}
