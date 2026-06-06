import http from '@src/shared/utils/http';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@repo/shared';

type Props = {
  meetingId: string;
};

export function useMeetingMinuite({ meetingId }: Props) {
  return useQuery({
    queryKey: QUERY_KEYS.MEETINGS_KEYS.MINUTES(meetingId),
    queryFn: () => http.get(`/meeting/${meetingId}/minuites`),
    select: (data) => data.data,
    enabled: !!meetingId,
  });
}
