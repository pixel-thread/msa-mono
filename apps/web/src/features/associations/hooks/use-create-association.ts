import { QUERY_KEYS } from '@repo/shared';
import { ENDPOINTS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type { CreateAssociationInput } from '../validators';

export function useCreateAssociation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAssociationInput) => http.post(ENDPOINTS.ASSOCIATIONS.ROOT, data),
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
