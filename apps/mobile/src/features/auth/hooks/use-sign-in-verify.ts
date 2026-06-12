import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useSecureTokenStore } from '../store';
import type { SignInVerifyFormData } from '../validators';
import http from '@src/shared/utils/http';
import { toast } from 'sonner-native';
import { ENDPOINTS } from '@repo/shared';

type SignInVerifyResponse = {
  access_token: string;
  refresh_token: string;
};

/**
 * Handles MFA (Multi-Factor Authentication) verification during sign-in.
 *
 * Verifies the 6-digit code sent to the user's email/phone during MFA flow.
 * On successful verification, stores the authentication tokens and redirects
 * the user to the protected dashboard.
 *
 * @param data - MFA verification data
 * @param data.code - 6-digit verification code (numbers only)
 * @param data.mfa_temp_token - Optional temporary token from sign-in response
 *
 * @returns Mutation result containing verification response
 * @returns {boolean} success - Whether the verification was successful
 * @returns {string} message - Response message from the server
 * @returns {object} data - Authentication tokens
 * @returns {string} data.access_token - JWT access token
 * @returns {string} data.refresh_token - Refresh token for token refresh
 *
 * @throws {Error} Network errors, invalid codes, or expired tokens
 *
 * @example
 * ```typescript
 * const verifyMutation = useSignInVerify();
 *
 * // In your MFA verification form submit handler:
 * verifyMutation.mutate({
 *   code: '123456',
 *   mfa_temp_token: tempToken // from URL query param
 * });
 *
 * // Handle different states:
 * if (verifyMutation.isPending) {
 *   console.log('Verifying code...');
 * }
 *
 * if (verifyMutation.isError) {
 *   console.log('Invalid code:', verifyMutation.error);
 * }
 *
 * if (verifyMutation.isSuccess && verifyMutation.data?.success) {
 *   // User will be automatically redirected to dashboard
 * }
 * ```
 *
 * @example
 * // Extracting tempToken from URL (using expo-router):
 * import { useSearchParams } from 'expo-router';
 *
 * const [params] = useSearchParams();
 * const tempToken = params.tempToken;
 *
 * @see {@link https://docs.example.com/auth/mfa} MFA API documentation
 * @see {@link useSignIn} For initiating MFA flow
 * @see {@link useResendSignInVerifyCode} For requesting a new code
 */
export const useSignInVerify = () => {
  const router = useRouter();
  const { setRefreshToken, setAccessToken } = useSecureTokenStore();

  return useMutation({
    mutationFn: (data: SignInVerifyFormData) =>
      http.post<SignInVerifyResponse>(ENDPOINTS.AUTH.SIGNIN_VERIFY, data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message);
        const refreshToken = response.data?.refresh_token;
        const accessToken = response.data?.access_token;

        if (refreshToken) {
          setRefreshToken(refreshToken);
        }

        if (accessToken) {
          setAccessToken(accessToken);
        }
        router.replace('/(protected)/(drawer)/(tabs)');
      } else {
        toast.error(response.message);
      }
    },
  });
};
