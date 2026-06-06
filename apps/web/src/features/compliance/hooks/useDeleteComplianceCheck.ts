import { useMutation, useQueryClient } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { QUERY_KEYS } from '@repo/shared';
import { toast } from 'sonner';
import { complianceEndpoints } from '../utils/constants/endpoints';

export function useDeleteComplianceCheck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => http.delete(complianceEndpoints.checkById(id)),
    onSuccess: (response) => {
      if ((response as { success: boolean }).success) {
        toast.success('Compliance check deleted successfully');
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COMPLIANCE_KEYS.CHECKS() });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COMPLIANCE_KEYS.EVIDENCE() });
        return;
      }
      toast.error((response as { message: string }).message);
    },
    onError: () => {
      toast.error('Failed to delete compliance check');
    },
  });
}
