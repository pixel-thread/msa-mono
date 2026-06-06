import { useMutation, useQueryClient } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import { toast } from 'sonner';
import type { CreateMemberTypeInput } from '../validators';

export function useCreateMemberType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMemberTypeInput) => http.post(ENDPOINTS.MEMBER_TYPES.ROOT, data),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Member type created successfully');
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MEMBER_TYPES_KEYS.LIST() });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MEMBER_TYPES_KEYS.ALL() });
        return;
      }
      toast.error(data.message);
    },
    onError: () => {
      toast.error('Failed to create member type');
    },
  });
}
