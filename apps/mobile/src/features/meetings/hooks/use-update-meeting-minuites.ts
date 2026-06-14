import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UpdateMeetingMinuteInput } from '../validators/minuites';
import http from '@src/shared/utils/http';
import { toast } from 'sonner-native';
import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';

type Props = {
  meetingId: string;
  meetingMinuiteId: string;
};

export function useUpdateMeetingMinuite({ meetingId, meetingMinuiteId }: Props) {
  const queryClient = useQueryClient();
  const url = ENDPOINTS.MEETINGS.MINUTES.DETAIL;
  return useMutation({
    mutationFn: (data: UpdateMeetingMinuteInput) =>
      http.put(url(meetingId, meetingMinuiteId), data),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MEETINGS_KEYS.MINUTES(meetingId) });
        return data;
      }
      toast.error(data.message);
      return data;
    },
  });
}
