import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS, ENDPOINTS } from '@repo/shared';
import { toast } from 'sonner-native';

type PaymentData = {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
};

/**
 * Verifies a Razorpay payment and confirms the subscription order.
 *
 * Submits the payment verification data to the server after a successful
 * Razorpay payment. Includes cryptographic signature verification to ensure
 * payment authenticity. Automatically invalidates the payment history cache.
 *
 * @returns Mutation object for verifying payments
 * @returns {MutateFunction} mutate - Function to trigger the mutation
 * @returns {MutateFunction} mutateAsync - Async version of mutate
 * @returns {boolean} isPending - Whether the mutation is in progress
 * @returns {boolean} isError - Whether an error occurred
 * @returns {boolean} isSuccess - Whether the mutation was successful
 * @returns {Error} error - The error object if an error occurred
 *
 * @param data - Payment verification data from Razorpay
 * @param data.razorpayOrderId - The order ID from Razorpay
 * @param data.razorpayPaymentId - The payment ID from Razorpay
 * @param data.razorpaySignature - The cryptographic signature from Razorpay
 *
 * @throws {Error} Network errors or API failures
 * @throws {Error} Invalid signature (payment tampered)
 * @throws {Error} Payment already processed
 *
 * @example
 * ```typescript
 * const verifyPaymentMutation = useVerifyPayment();
 *
 * // In your Razorpay success handler:
 * const handlePaymentSuccess = async (response: RazorpayResponse) => {
 *   verifyPaymentMutation.mutate({
 *     razorpayOrderId: response.razorpay_order_id,
 *     razorpayPaymentId: response.razorpay_payment_id,
 *     razorpaySignature: response.razorpay_signature
 *   });
 * };
 *
 * // Handle verification result:
 * if (verifyPaymentMutation.isSuccess && verifyPaymentMutation.data?.success) {
 *   Alert.alert('Success', 'Payment verified! Subscription activated.');
 *   router.replace('/(protected)/subscription/success');
 * }
 *
 * if (verifyPaymentMutation.isError) {
 *   Alert.alert('Error', 'Payment verification failed. Contact support.');
 * }
 * ```
 *
 * @example
 * // Complete Razorpay integration:
 * const razorpay = new Razorpay({
 *   key: EXPO_PUBLIC_RAZORPAY_KEY,
 *   amount: selectedPlan.amount,
 *   currency: selectedPlan.currency,
 *   name: 'Association Name',
 *   handler: handlePaymentSuccess,
 * });
 *
 * @see {@link https://docs.example.com/subscriptions/verify-payment} Payment verification API documentation
 * @see {@link usePaymentOption} For creating the payment order
 * @see {@link usePaymentHistory} For viewing payment history after verification
 */
export function useVerifyPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PaymentData) => http.post(ENDPOINTS.PAYMENTS.RAZORPAY.VERIFY, data),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUBSCRIPTIONS_KEYS.PAYMENT_HISTORY() });
        return data;
      }
      toast.error(data.message);
      return data;
    },
  });
}