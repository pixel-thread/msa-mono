import { useMutation } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { toast } from 'sonner-native';
import { ENDPOINTS } from '@repo/shared';

/**
 * Resends the MFA verification code during sign-in authentication.
 *
 * Requests a new verification code to be sent to the user's email/phone.
 * Typically used when the original code has expired or wasn't received.
 *
 * @returns Mutation result containing resend response
 * @returns {boolean} success - Whether the code was successfully resent
 * @returns {string} message - Response message from the server
 *
 * @throws {Error} Network errors or rate limiting (too many requests)
 *
 * @example
 * ```typescript
 * const resendMutation = useResendSignInVerifyCode();
 *
 * // In your resend button onClick handler:
 * const handleResendCode = () => {
 *   resendMutation.mutate();
 * };
 *
 * // Disable button during cooldown (e.g., 60 seconds):
 * const [cooldown, setCooldown] = useState(0);
 *
 * useEffect(() => {
 *   if (resendMutation.isSuccess) {
 *     setCooldown(60);
 *     const timer = setInterval(() => {
 *       setCooldown((prev) => {
 *         if (prev <= 1) {
 *           clearInterval(timer);
 *           return 0;
 *         }
 *         return prev - 1;
 *       });
 *     }, 1000);
 *   }
 * }, [resendMutation.isSuccess]);
 *
 * // UI:
 * <Button
 *   disabled={cooldown > 0 || resendMutation.isPending}
 *   onPress={handleResendCode}
 * >
 *   {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
 * </Button>
 * ```
 *
 * @see {@link https://docs.example.com/auth/resend-code} Resend API documentation
 * @see {@link useSignInVerify} For verifying the new code
 */
export const useResendSignInVerifyCode = () => {
  return useMutation({
    mutationFn: () => http.post(ENDPOINTS.AUTH.SIGNIN_RESEND),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    },
  });
};
