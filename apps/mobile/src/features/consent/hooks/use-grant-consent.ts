import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ConsentActionResponse, GrantConsentRequest } from '../types';
import { consentEndpoints, ConsentQueryKeys } from '../utils/constants';
import http from '@src/shared/utils/http';
import { toast } from 'sonner-native';

export const useGrantConsent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GrantConsentRequest) =>
      http.post<ConsentActionResponse>(consentEndpoints.grant, data),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ConsentQueryKeys.my() });
        queryClient.invalidateQueries({ queryKey: ConsentQueryKeys.history() });
        return;
      }
      toast.error(data.message);
      return data;
    },
  });
};
