import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useRejectDsarTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      http.post(ENDPOINTS.DSAR.REJECT(id), { reason }),
    onSuccess: (response) => {
      if ((response as { success: boolean }).success) {
        toast.success('DSAR ticket rejected');
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DSAR_KEYS.TICKETS() });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DSAR_KEYS.SLA() });
        return;
      }
      toast.error((response as { message: string }).message);
    },
    onError: () => {
      toast.error('Failed to reject DSAR ticket');
    },
  });
}
