import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UpdateMeetingMinuteInput } from '../validators/minutes';
import http from '@src/shared/utils/http';
import { toast } from 'sonner-native';
import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';

type Props = {
  meetingId: string;
  meetingMinuteId: string;
};

export function useUpdateMeetingMinutes({ meetingId, meetingMinuteId }: Props) {
  const queryClient = useQueryClient();
  const url = ENDPOINTS.MEETINGS.MINUTES.DETAIL;
  return useMutation({
    mutationFn: (data: UpdateMeetingMinuteInput) => http.put(url(meetingId, meetingMinuteId), data),
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
