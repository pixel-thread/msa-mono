import { ENDPOINTS } from '@repo/shared';
import { type VerifySignInInput, VerifySignInSchema } from '@src/features/auth/validators';
import http from '@src/shared/utils/http';
import { useMutation } from '@tanstack/react-query';

export function useVerifyMfa() {
  return useMutation({
    mutationFn: async (data: VerifySignInInput) => {
      const result = VerifySignInSchema.parse(data);
      return http.post(ENDPOINTS.AUTH.SIGNIN_VERIFY, result);
    },
  });
}
