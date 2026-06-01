import { useMutation, useQueryClient } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { ledgerEndpoints } from '../utils/constants/endpoints';
import { useToast } from '@src/shared/hooks/use-toast';

export function useSeedAccounts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      return http.post(ledgerEndpoints.seedAccounts, {});
    },
    onSuccess: () => {
      toast({
        title: 'Accounts Seeded',
        description: 'Standard chart of accounts has been initialized.',
      });
      queryClient.invalidateQueries({ queryKey: ['ledger-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['ledger-summary'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to seed accounts.',
        variant: 'destructive',
      });
    },
  });
}