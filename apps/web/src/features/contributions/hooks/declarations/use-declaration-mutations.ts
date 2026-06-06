import { useMutation, useQueryClient } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { toast } from 'sonner';
import { declarationEndpoints } from '../../utils/constants/endpoints';
import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';

export function useApproveDeclaration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, remark }: { id: string; remark?: string }) =>
      http.post(ENDPOINTS.CONTRIBUTION.APPROVE_DECLARATION(id), { remark }),
    onSuccess: () => {
      toast.success('Declaration approved successfully');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONTRIBUTIONS_KEYS.DECLARATIONS() });
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
      http.post(ENDPOINTS.CONTRIBUTION.REJECT_DECLARATION(id), { remark }),
    onSuccess: () => {
      toast.success('Declaration rejected');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONTRIBUTIONS_KEYS.DECLARATIONS() });
    },
    onError: () => {
      toast.error('Failed to reject declaration');
    },
  });
}
