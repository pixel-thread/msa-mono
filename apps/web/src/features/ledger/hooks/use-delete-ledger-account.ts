import { ENDPOINTS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useDeleteLedgerAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => http.delete(ENDPOINTS.LEDGER.ACCOUNT_DETAIL(id)),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Account deleted successfully');
        queryClient.invalidateQueries({ queryKey: ['ledger-accounts'] });
        return data;
      }
      toast.error('Account deleted successfully');
      return data;
    },
  });
}
