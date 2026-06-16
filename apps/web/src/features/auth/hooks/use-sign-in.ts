import { ENDPOINTS } from '@repo/shared';
import { type SignInInput } from '@src/features/auth/validators';
import { useAuthStore } from '@src/shared/stores';
import http from '@src/shared/utils/http';
import { useMutation } from '@tanstack/react-query';

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
      return data;
    },
  });
}
