import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import type { SignUpFormData } from '../validators';
import http from '@src/shared/utils/http';
import { toast } from 'sonner-native';
import { ENDPOINTS } from '@repo/shared';

/**
 * Handles new user registration and account creation.
 *
 * Sends a sign-up request to create a new user account. On successful registration,
 * displays a success message and redirects the user to the sign-in page to log in
 * with their newly created credentials.
 *
 * @param data - User registration data
 * @param data.name - User's full name (minimum 2 characters)
 * @param data.email - User's email address
 * @param data.password - User's password (must meet security requirements)
 * @param data.association_slug - Optional association slug (defaults to env variable)
 *
 * @returns Mutation result containing registration response
 * @returns {boolean} success - Whether the registration was successful
 * @returns {string} message - Response message from the server
 *
 * @throws {Error} Network errors, validation failures, or server-side errors
 *
 * @example
 * ```typescript
 * const signUpMutation = useSignUp();
 *
 * // In your registration form submit handler:
 * signUpMutation.mutate({
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   password: 'SecurePass123!'
 * });
 *
 * // Handle different states:
 * if (signUpMutation.isPending) {
 *   console.log('Creating account...');
 * }
 *
 * if (signUpMutation.isError) {
 *   console.log('Registration failed:', signUpMutation.error);
 * }
 *
 * if (signUpMutation.isSuccess && signUpMutation.data?.success) {
 *   // User will be automatically redirected to sign-in page
 * }
 * ```
 *
 * @see {@link https://docs.example.com/auth/sign-up} Sign-up API documentation
 * @see {@link useSignIn} For logging in after successful registration
 */
export const useSignUp = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: SignUpFormData) => http.post(ENDPOINTS.AUTH.SIGNUP, data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message);
        router.push('/(auth)/sign-in');
      } else {
        toast.error(response.message);
      }
    },
  });
};