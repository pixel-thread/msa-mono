import { useMutation, useQueryClient } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { QUERY_KEYS } from '@repo/shared';
import { toast } from 'sonner';
import type { CreateAssociationInput } from '../validators';
import { associationsEndpoints } from '../utils/constants/endpoints';

export function useCreateAssociation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAssociationInput) => http.post(associationsEndpoints.base, data),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Association created successfully');
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ASSOCIATIONS_KEYS.LIST() });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ASSOCIATIONS_KEYS.ALL() });
        return;
      }
      toast.error(data.message);
    },
    onError: () => {
      toast.error('Failed to create association');
    },
  });
}
