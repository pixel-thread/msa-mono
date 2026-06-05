import { useMutation, useQueryClient } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { toast } from 'sonner';
import { declarationEndpoints } from '../../utils/constants/endpoints';
import { ENDPOINTS } from '@repo/shared';

export function useApproveDeclaration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, remark }: { id: string; remark?: string }) =>
      http.post(ENDPOINTS.CONTRIBUTION.APPROVE_DECLARATION(id), { remark }),
    onSuccess: () => {
      toast.success('Declaration approved successfully');
      queryClient.invalidateQueries({ queryKey: ['declarations'] });
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
      queryClient.invalidateQueries({ queryKey: ['declarations'] });
    },
    onError: () => {
      toast.error('Failed to reject declaration');
    },
  });
}
