import { ENDPOINTS } from '@repo/shared';
import { type ForgotPasswordInput, ForgotPasswordSchema } from '@src/features/auth/validators';
import http from '@src/shared/utils/http';
import { useMutation } from '@tanstack/react-query';

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (data: ForgotPasswordInput) => {
      const result = ForgotPasswordSchema.parse(data);
      return http.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, result);
    },
  });
}
