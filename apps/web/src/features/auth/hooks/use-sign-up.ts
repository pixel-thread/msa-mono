import { useMutation } from '@tanstack/react-query';

import http from '@src/shared/utils/http';
import { type MembershipApplicationInput } from '@src/features/membership-applications/validators';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { ENDPOINTS } from '@repo/shared';

export function useSignUp() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (data: MembershipApplicationInput) => http.post(ENDPOINTS.AUTH.SIGNUP, data),
    onSuccess: (data) => {
      if (data.success) {
        navigate({ to: '/sign-in' });
        toast.success(data.message);
        return;
      }
      toast.error(data.message);
    },
  });
}
