import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateMeetingMinuteInput } from '../validators/minutes';
import { toast } from 'sonner-native';
import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';

type Props = {
  meetingId: string;
};
export const useCreateMeetingMinute = ({ meetingId }: Props) => {
  const queryClient = useQueryClient();
  const url = ENDPOINTS.MEETINGS.MINUTES.ADD(meetingId);
  return useMutation({
    mutationFn: (data: CreateMeetingMinuteInput) => http.post(url, data),
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
};
