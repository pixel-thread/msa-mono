import http from '@src/shared/utils/http';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner-native';
import { ENDPOINTS } from '@repo/shared';
import { useRouter } from 'expo-router';
import { ForgotPasswordInput } from '../validators/forgot-password';

export function useForgotPassword() {
  const router = useRouter();
  return useMutation({
    mutationFn: async (data: ForgotPasswordInput) =>
      http.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, data),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        router.push('/(auth)/reset-password');
        return;
      }
      toast.error(data.message);
      return;
    },
  });
}
