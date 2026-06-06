import { useMutation } from '@tanstack/react-query';

import http from '@src/shared/utils/http';
import { ResetPasswordSchema, type ResetPasswordInput } from '@src/features/auth/validators';
import { ENDPOINTS } from '@repo/shared';

export function useResetPassword() {
  return useMutation({
    mutationFn: async (data: ResetPasswordInput) => {
      const result = ResetPasswordSchema.parse(data);
      return http.post(ENDPOINTS.AUTH.RESET_PASSWORD, result);
    },
  });
}
