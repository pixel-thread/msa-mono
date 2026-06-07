import { ENDPOINTS } from '@repo/shared';
import { type MembershipApplicationInput } from '@src/features/membership-applications/validators';
import http from '@src/shared/utils/http';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';

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
