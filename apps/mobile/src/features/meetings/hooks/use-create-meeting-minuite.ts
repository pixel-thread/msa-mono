import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateMeetingMinuteInput } from '../validators/minuites';
import { toast } from 'sonner-native';
import { QUERY_KEYS } from '@repo/shared';

type Props = {
  meetingId: string;
};
export const useCreateMeetingMinuite = ({ meetingId }: Props) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMeetingMinuteInput) =>
      http.post(`/meeting/${meetingId}/minuite`, data),
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
