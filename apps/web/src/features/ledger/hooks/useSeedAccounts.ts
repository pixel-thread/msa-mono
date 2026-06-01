import { useMutation, useQueryClient } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { ledgerEndpoints } from '../utils/constants/endpoints';
import { toast } from 'sonner';

export function useSeedAccounts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return http.post(ledgerEndpoints.seedAccounts, {});
    },
    onSuccess: () => {
      toast.success('Accounts Seeded', {
        description: 'Standard chart of accounts has been initialized.',
      });
      queryClient.invalidateQueries({ queryKey: ['ledger-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['ledger-summary'] });
    },
    onError: (error: Error) => {
      toast.error('Error', {
        description: error.message || 'Failed to seed accounts.',
      });
    },
  });
}
