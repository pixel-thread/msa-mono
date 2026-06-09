import { ENDPOINTS } from '@repo/shared';
import { type ChangePasswordInput, ChangePasswordSchema } from '@src/features/auth/validators';
import http from '@src/shared/utils/http';
import { useMutation } from '@tanstack/react-query';

export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: ChangePasswordInput) => {
      const result = ChangePasswordSchema.parse(data);
      return http.post(ENDPOINTS.AUTH.CHANGE_PASSWORD, {
        currentPassword: result.currentPassword,
        newPassword: result.newPassword,
      });
    },
  });
}
