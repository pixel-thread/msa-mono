import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ConsentActionResponse, RevokeConsentRequest } from '../types';
import http from '@src/shared/utils/http';
import { consentEndpoints } from '../utils/constants';
import { QUERY_KEYS } from '@repo/shared';
import { toast } from 'sonner-native';

export const useRevokeConsent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RevokeConsentRequest) =>
      http.post<ConsentActionResponse>(consentEndpoints.revoke, data),
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
