import { useMutation, useQueryClient } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { QUERY_KEYS } from '@repo/shared';
import { toast } from 'sonner';
import { dsarEndpoints } from '../utils/constants/endpoints';

interface RespondData {
  status: string;
  notes?: string;
  responseType?: string;
  storageKey?: string;
  deliveryMethod?: string;
}

export function useRespondToDsarTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RespondData }) =>
      http.post(dsarEndpoints.respond(id), data),
    onSuccess: (response) => {
      if ((response as { success: boolean }).success) {
        toast.success('DSAR ticket responded successfully');
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DSAR_KEYS.TICKETS() });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DSAR_KEYS.SLA() });
        return;
      }
      toast.error((response as { message: string }).message);
    },
    onError: () => {
      toast.error('Failed to respond to DSAR ticket');
    },
  });
}
