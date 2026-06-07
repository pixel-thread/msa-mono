import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { QUERY_KEYS } from '@repo/shared';
import type { Announcement } from '../types';
import { ENDPOINTS } from '@repo/shared';

export interface AnnouncementDetail extends Announcement {
  readReceipts: {
    id: string;
    readAt: string;
    user: {
      id: string;
      name: string | null;
      membershipNumber: string | null;
    };
  }[];
}

export function useAnnouncement(announcementId: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.ANNOUNCEMENTS_KEYS.DETAIL(announcementId),
    queryFn: async () => {
      const res = await http.get<AnnouncementDetail>(
        ENDPOINTS.ANNOUNCEMENTS.DETAILS(announcementId),
      );
      if (!res.success || !res.data) {
        throw new Error(res.message || 'Failed to fetch announcement');
      }
      return res.data;
    },
    enabled: !!announcementId,
  });

  return {
    announcement: data,
    isLoading,
    error,
    refetch,
  };
}
