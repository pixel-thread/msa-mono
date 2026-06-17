import { QUERY_KEYS } from '@repo/shared';
import { ENDPOINTS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useDeleteComplianceCheck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => http.delete(ENDPOINTS.COMPLIANCE.CHECK_DETAIL(id)),
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
