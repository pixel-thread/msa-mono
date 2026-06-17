import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useCancelMeeting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: QUERY_KEYS.MEETINGS_KEYS.LIST(1),
    mutationFn: (id: string) => http.post(ENDPOINTS.MEETINGS.CANCEL(id)),
    onSuccess: (data, variables) => {
      if (data.success) {
        const id = variables;
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MEETINGS_KEYS.LIST(1) });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MEETINGS_KEYS.DETAIL(id) });
        toast.success(data.message);
        return data;
      }
      toast.error(data.message);
      return data;
    },
  });
}
