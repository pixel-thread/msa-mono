import { QUERY_KEYS } from '@repo/shared';
import { ENDPOINTS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useUploadAnnouncementImage(announcementId: string) {
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return http.post(ENDPOINTS.ANNOUNCEMENTS.UPLOAD(announcementId), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ANNOUNCEMENTS_KEYS.LISTS() });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.ANNOUNCEMENTS_KEYS.DETAIL(announcementId),
        });
        toast.success(res.message);
        return res;
      }
      toast.error(res.message || 'Failed to upload image');
      return res;
    },
  });

  return {
    uploadImage: uploadMutation.mutate,
    isUploading: uploadMutation.isPending,
  };
}
