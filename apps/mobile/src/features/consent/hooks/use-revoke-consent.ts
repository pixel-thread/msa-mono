import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ConsentActionResponse, RevokeConsentRequest } from '../types';
import http from '@src/shared/utils/http';
import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import { toast } from 'sonner-native';

export const useRevokeConsent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RevokeConsentRequest) =>
      http.post<ConsentActionResponse>(ENDPOINTS.CONSENT.REVOKE, data),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONSENT_KEYS.MY() });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONSENT_KEYS.HISTORY() });
        return;
      }
      toast.error(data.message);
      return;
    },
  });
};
