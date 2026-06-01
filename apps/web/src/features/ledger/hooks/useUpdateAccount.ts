import { useMutation, useQueryClient } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { ledgerEndpoints } from '../utils/constants/endpoints';
import { useToast } from '@src/shared/hooks/use-toast';

interface UpdateAccountPayload {
  id: string;
  name: string;
  description?: string;
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (payload: UpdateAccountPayload) => {
      return http.put(ledgerEndpoints.updateAccount(payload.id), {
        name: payload.name,
        description: payload.description,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Account Updated',
        description: 'The account has been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['ledger-accounts'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update account.',
        variant: 'destructive',
      });
    },
  });
}