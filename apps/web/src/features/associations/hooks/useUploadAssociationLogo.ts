'use client';

import { QUERY_KEYS } from '@repo/shared';
import { ENDPOINTS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useUploadAssociationLogo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => {
      const formData = new FormData();
      formData.append('logo', file);
      return http.post(ENDPOINTS.ASSOCIATIONS.LOGO(id), formData);
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Logo uploaded successfully');
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ASSOCIATIONS_KEYS.ALL() });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ASSOCIATIONS_KEYS.LIST() });
        return;
      }
      toast.error(data.message);
    },
    onError: () => {
      toast.error('Failed to upload logo');
    },
  });
}
