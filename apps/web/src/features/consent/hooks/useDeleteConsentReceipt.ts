import { useMutation, useQueryClient } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { QUERY_KEYS } from '@repo/shared';
import { toast } from 'sonner';
import { ENDPOINTS } from '@repo/shared';

export function useDeleteConsentReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => http.delete(ENDPOINTS.CONSENT.RECEIPT(id)),
    onSuccess: (response) => {
      if ((response as { success: boolean }).success) {
        toast.success('Consent receipt deleted successfully');
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONSENT_KEYS.RECORDS() });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONSENT_KEYS.REPORT() });
        return;
      }
      toast.error((response as { message: string }).message);
    },
    onError: () => {
      toast.error('Failed to delete consent receipt');
    },
  });
}
