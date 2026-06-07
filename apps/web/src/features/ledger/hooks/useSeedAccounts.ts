import { ENDPOINTS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useSeedAccounts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return http.post(ENDPOINTS.LEDGER.SEED_ACCOUNTS, {});
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
