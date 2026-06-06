import { useMutation } from '@tanstack/react-query';

import http from '@src/shared/utils/http';
import { type SignInInput } from '@src/features/auth/validators';
import { useAuthStore } from '@src/shared/stores';
import { ENDPOINTS } from '@repo/shared';

type SigninResponse = {
  mfaRequired?: boolean;
  tempToken?: string;
};

export function useSignIn() {
  const { fetchUser } = useAuthStore();
  return useMutation({
    mutationFn: (data: SignInInput) => http.post<SigninResponse>(ENDPOINTS.AUTH.SIGNIN, data),
    onSuccess: (data) => {
      if (data.success) {
        fetchUser();
        return data;
      }
    },
  });
}
