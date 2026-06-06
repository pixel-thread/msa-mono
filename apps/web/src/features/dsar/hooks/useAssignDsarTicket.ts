import { useMutation, useQueryClient } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import { toast } from 'sonner';

export function useAssignDsarTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, assignedToId }: { id: string; assignedToId: string }) =>
      http.patch(ENDPOINTS.DSAR.ASSIGN(id), { assignedToId }),
    onSuccess: (response) => {
      if ((response as { success: boolean }).success) {
        toast.success('DSAR ticket assigned successfully');
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DSAR_KEYS.TICKETS() });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DSAR_KEYS.TICKET() });
        return;
      }
      toast.error((response as { message: string }).message);
    },
    onError: () => {
      toast.error('Failed to assign DSAR ticket');
    },
  });
}
