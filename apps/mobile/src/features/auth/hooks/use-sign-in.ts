import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import type { SignInFormData } from '../validators';
import http from '@src/shared/utils/http';
import { toast } from 'sonner-native';
import { useAuthStore, useSecureTokenStore } from '../store';
import { authEndpoints } from '../utils/constants/endpoints';

type SignInSuccessData = {
  mfaRequired?: boolean;
  tempToken?: string;
  access_token?: string;
  refresh_token?: string;
};

/**
 * Handles user sign-in authentication with optional MFA support.
 *
 * Initiates a sign-in request to the authentication endpoint. If MFA is required,
 * the user is redirected to the verification screen with a temporary token.
 * On successful authentication, tokens are stored and the user is redirected to the protected dashboard.
 *
 * @param data - Sign-in credentials containing email and password
 * @param data.email - User's email address
 * @param data.password - User's password
 *
 * @returns Mutation result containing authentication response
 * @returns {boolean} success - Whether the sign-in was successful
 * @returns {string} message - Response message from the server
 * @returns {object} data - Authentication data including tokens or MFA requirement
 * @returns {boolean} data.mfaRequired - Whether MFA verification is required
 * @returns {string} data.tempToken - Temporary token for MFA verification (if mfaRequired)
 * @returns {string} data.access_token - JWT access token (if authenticated)
 * @returns {string} data.refresh_token - Refresh token for token refresh (if authenticated)
 *
 * @throws {Error} Network errors or server-side authentication failures
 *
 * @example
 * ```typescript
 * const signInMutation = useSignIn();
 *
 * // In your form submit handler:
 * signInMutation.mutate({
 *   email: 'user@example.com',
 *   password: 'password123'
 * });
 *
 * // Handle different states:
 * if (signInMutation.isPending) {
 *   console.log('Signing in...');
 * }
 *
 * if (signInMutation.isError) {
 *   console.log('Sign in failed:', signInMutation.error);
 * }
 * ```
 *
 * @example
 * // Handling MFA flow:
 * if (signInMutation.data?.data?.mfaRequired) {
 *   // User will be automatically redirected to verify screen
 * }
 *
 * @see {@link https://docs.example.com/auth/sign-in} Sign-in API documentation
 * @see {@link useSignInVerify} For MFA verification after this hook redirects
 * @see {@link useResendSignInVerifyCode} For resending verification code
 */
export const useSignIn = () => {
  const router = useRouter();
  const { setAccessToken, setRefreshToken, setMfaTempToken } = useSecureTokenStore();
  const { fetchUser } = useAuthStore();

  return useMutation({
    mutationFn: (data: SignInFormData) => http.post<SignInSuccessData>(authEndpoints.signIn, data),
    onSuccess: (response) => {
      if (response.success) {
        if (response.data?.mfaRequired && response.data.tempToken) {
          setMfaTempToken(response.data.tempToken);
          router.push('/(auth)/sign-in-verify');
        } else {
          const refreshToken = response.data?.refresh_token;
          const accessToken = response.data?.access_token;
          if (accessToken) {
            setAccessToken(accessToken);
          }

          if (refreshToken) {
            setRefreshToken(refreshToken);
          }
          fetchUser();
          return;
        }
        return response;
      } else {
        console.log(response);
        toast.error(response.message);
        return response;
      }
    },
  });
};
