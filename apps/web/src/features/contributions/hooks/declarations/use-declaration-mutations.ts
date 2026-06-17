import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useApproveDeclaration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, remark }: { id: string; remark?: string }) =>
      http.post(ENDPOINTS.DECLARATION.APPROVE(id), { remark }),
    onSuccess: () => {
      toast.success('Declaration approved successfully');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DECLARATIONS_KEYS.LIST() });
    },
    onError: () => {
      toast.error('Failed to approve declaration');
    },
  });
}

export function useRejectDeclaration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, remark }: { id: string; remark?: string }) =>
      http.post(ENDPOINTS.DECLARATION.REJECT(id), { remark }),
    onSuccess: () => {
      toast.success('Declaration rejected');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DECLARATIONS_KEYS.LIST() });
    },
    onError: () => {
      toast.error('Failed to reject declaration');
    },
  });
}
