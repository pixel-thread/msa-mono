import { ENDPOINTS } from '@repo/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { toast } from 'sonner';

interface UpdateAccountPayload {
  id: string;
  name: string;
  description?: string;
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateAccountPayload) => {
      return http.put(ENDPOINTS.LEDGER.ACCOUNT_DETAIL(payload.id), {
        name: payload.name,
        description: payload.description,
      });
    },
    onSuccess: () => {
      toast.success('Account Updated', {
        description: 'The account has been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['ledger-accounts'] });
    },
    onError: (error: Error) => {
      toast.error('Error', {
        description: error.message || 'Failed to update account.',
      });
    },
  });
}
