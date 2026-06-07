import { QUERY_KEYS } from '@repo/shared';
import { ENDPOINTS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type { UpdateConsentReceiptInput } from '../validators/consent.validators';

export function useUpdateConsentReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateConsentReceiptInput }) =>
      http.patch(ENDPOINTS.CONSENT.RECEIPT(id), data),
    onSuccess: (response) => {
      if ((response as { success: boolean }).success) {
        toast.success('Consent receipt updated successfully');
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONSENT_KEYS.RECORDS() });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONSENT_KEYS.REPORT() });
        return;
      }
      toast.error((response as { message: string }).message);
    },
    onError: () => {
      toast.error('Failed to update consent receipt');
    },
  });
}
