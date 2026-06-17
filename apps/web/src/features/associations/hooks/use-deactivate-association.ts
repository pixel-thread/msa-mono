import { QUERY_KEYS } from '@repo/shared';
import { ENDPOINTS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

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
