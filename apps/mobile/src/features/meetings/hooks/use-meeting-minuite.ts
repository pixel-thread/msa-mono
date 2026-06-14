import http from '@src/shared/utils/http';
import { useQuery } from '@tanstack/react-query';
import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import { useAuthStore } from '@src/shared/store';

type Props = {
  meetingId: string;
};

export function useMeetingMinuite({ meetingId }: Props) {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: QUERY_KEYS.MEETINGS_KEYS.MINUTES(meetingId),
    queryFn: () => http.get(ENDPOINTS.MEETINGS.MINUTES.LIST(meetingId)),
    select: (data) => data.data,
    enabled: !!meetingId && isAuthenticated,
  });
}
