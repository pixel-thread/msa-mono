import { QUERY_KEYS } from '@repo/shared';
import { ENDPOINTS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useTriggerComplianceCheck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (checkTypes?: string[]) =>
      http.post(ENDPOINTS.COMPLIANCE.CHECKS, checkTypes ? { checkTypes } : {}),
    onSuccess: (response) => {
      if (response.success) {
        toast.success('Compliance checks completed successfully');
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COMPLIANCE_KEYS.CHECKS() });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COMPLIANCE_KEYS.EVIDENCE() });
        return;
      }
      toast.error(response.message);
      return;
    },
    onError: () => {
      toast.error('Failed to run compliance checks');
    },
  });
}
