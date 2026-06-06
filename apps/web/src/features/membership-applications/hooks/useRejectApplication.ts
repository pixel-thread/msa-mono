import { useMutation, useQueryClient } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { QUERY_KEYS } from '@repo/shared';
import { toast } from 'sonner';
import { membershipApplicationEndpoints } from '../utils/constants/endpoints';

interface RejectApplicationData {
  applicationId: string;
  rejectionReason: string;
}

export function useRejectApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RejectApplicationData) =>
      http.post(membershipApplicationEndpoints.reject(data.applicationId), {
        rejectionReason: data.rejectionReason,
      }),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message);
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.MEMBERSHIP_APPLICATIONS_KEYS.ALL(),
        });
        return;
      }
      toast.error(response.message);
      return;
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Failed to reject application');
      return;
    },
  });
}
