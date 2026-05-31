import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ConsentActionResponse, RevokeConsentRequest } from '../types';
import http from '@src/shared/utils/http';
import { consentEndpoints, ConsentQueryKeys } from '../utils/constants';
import { toast } from 'sonner-native';

export const useRevokeConsent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RevokeConsentRequest) =>
      http.post<ConsentActionResponse>(consentEndpoints.revoke, data),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ConsentQueryKeys.my() });
        queryClient.invalidateQueries({ queryKey: ConsentQueryKeys.history() });
        return;
      }
      toast.error(data.message);
      return;
    },
  });
};
