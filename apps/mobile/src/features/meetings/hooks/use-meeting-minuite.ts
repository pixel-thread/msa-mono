import http from '@src/shared/utils/http';
import { useQuery } from '@tanstack/react-query';

type Props = {
  meetingId: string;
};

export function useMeetingMinuite({ meetingId }: Props) {
  return useQuery({
    queryKey: ['meeting', 'minuites', meetingId],
    queryFn: () => http.get(`/meeting/${meetingId}/minuites`),
    select: (data) => data.data,
    enabled: !!meetingId,
  });
}
