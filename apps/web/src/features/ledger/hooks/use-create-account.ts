import { ENDPOINTS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface CreateAccountInput {
  code: string;
  name: string;
  type: string;
  description?: string;
}

export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateAccountInput) => http.post(ENDPOINTS.LEDGER.ACCOUNTS, input),
    onSuccess: (response) => {
      if (response.success) {
        toast.success('Account created successfully');
        queryClient.invalidateQueries({ queryKey: ['ledger-accounts'] });
        queryClient.invalidateQueries({ queryKey: ['ledger-summary'] });
      } else {
        toast.error(response.message || 'Failed to create account');
      }
    },
    onError: () => {
      toast.error('Failed to create account');
    },
  });
}
