import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useApproveEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (entryId: string) => http.post(ENDPOINTS.LEDGER.APPROVE_ENTRY(entryId)),
    onSuccess: (response) => {
      if (response.success) {
        toast.success('Entry approved successfully');
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LEDGER_KEYS.ENTRIES_LIST() });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LEDGER_KEYS.ACCOUNTS() });
      } else {
        toast.error(response.message || 'Failed to approve entry');
      }
    },
    onError: () => {
      toast.error('Failed to approve entry');
    },
  });
}
