import http from '@src/shared/utils/http';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner-native';
import { authEndpoints } from '../utils';
import { useRouter } from 'expo-router';
import { ResetPasswordInput } from '../validators/reset-password';

export function useResetPassword() {
  const router = useRouter();
  return useMutation({
    mutationFn: async (data: ResetPasswordInput) => {
      const { token, password } = data;
      return http.post(authEndpoints.resetPassword, { token, password });
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        router.push('/(auth)/sign-in');
        return;
      }
      toast.error(data.message);
      return;
    },
  });
}
