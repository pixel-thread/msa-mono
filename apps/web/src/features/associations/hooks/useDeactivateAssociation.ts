import { useMutation, useQueryClient } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { QUERY_KEYS } from '@repo/shared';
import { toast } from 'sonner';
import { ENDPOINTS } from '@repo/shared';

export function useDeactivateAssociation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => http.post(ENDPOINTS.ASSOCIATIONS.DEACTIVATE(id)),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Association deactivated successfully');
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ASSOCIATIONS_KEYS.LIST() });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ASSOCIATIONS_KEYS.ALL() });
        return;
      }
      toast.error(data.message);
    },
    onError: () => {
      toast.error('Failed to deactivate association');
    },
  });
}
