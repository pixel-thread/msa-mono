import { ENDPOINTS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useRejectEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      return http.post(ENDPOINTS.LEDGER.REJECT_ENTRY(id), { reason });
    },
    onSuccess: () => {
      toast.success('Entry Rejected', { description: 'The ledger entry was rejected.' });
      queryClient.invalidateQueries({ queryKey: ['ledger-entries'] });
      queryClient.invalidateQueries({ queryKey: ['ledger-summary'] });
    },
    onError: (error: Error) => {
      toast.error('Error', { description: error.message });
    },
  });
}
