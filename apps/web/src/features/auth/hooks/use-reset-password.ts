import { ENDPOINTS } from '@repo/shared';
import { type ResetPasswordInput,ResetPasswordSchema } from '@src/features/auth/validators';
import http from '@src/shared/utils/http';
import { useMutation } from '@tanstack/react-query';

export function useResetPassword() {
  return useMutation({
    mutationFn: async (data: ResetPasswordInput) => {
      const result = ResetPasswordSchema.parse(data);
      return http.post(ENDPOINTS.AUTH.RESET_PASSWORD, result);
    },
  });
}
