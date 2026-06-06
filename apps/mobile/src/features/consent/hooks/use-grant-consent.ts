import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ConsentActionResponse, GrantConsentRequest } from '../types';
import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { toast } from 'sonner-native';

export const useGrantConsent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GrantConsentRequest) =>
      http.post<ConsentActionResponse>(ENDPOINTS.CONSENT.GRANT, data),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONSENT_KEYS.MY() });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONSENT_KEYS.HISTORY() });
        return;
      }
      toast.error(data.message);
      return data;
    },
  });
};
