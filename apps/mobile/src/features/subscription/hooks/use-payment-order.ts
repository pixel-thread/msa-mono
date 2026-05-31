import http from '@src/shared/utils/http';
import { useMutation } from '@tanstack/react-query';
import { SubscriptionEndpoints } from '../utils/constants';
import { RazorpayOptions } from '../types/razorpay';
import { logger } from '@src/shared/utils';
import { toast } from 'sonner-native';

/**
 * Creates a new payment order with Razorpay.
 *
 * Initiates a payment order on the server and returns the Razorpay options
 * required to open the payment gateway. The order contains the transaction
 * details needed to initialize the Razorpay checkout.
 *
 * @param amount - The payment amount in the smallest currency unit (e.g., paise for INR)
 *
 * @returns Mutation object for creating payment orders
 * @returns {MutateFunction} mutate - Function to trigger the mutation
 * @returns {MutateFunction} mutateAsync - Async version of mutate
 * @returns {boolean} isPending - Whether the mutation is in progress
 * @returns {boolean} isError - Whether an error occurred
 * @returns {boolean} isSuccess - Whether the mutation was successful
 * @returns {Error} error - The error object if an error occurred
 * @returns {RazorpayOptions} data - The Razorpay options for payment checkout
 *
 * @throws {Error} Network errors or API failures
 * @throws {Error} Invalid amount
 * @throws {Error} Server-side order creation failure
 *
 * @example
 * ```typescript
 * const paymentOrderMutation = usePaymentOption();
 *
 * // Create order for selected plan:
 * const handleSubscribe = (plan: SubscriptionPlan) => {
 *   const amount = parseFloat(plan.amount) * 100; // Convert to paise
 *   paymentOrderMutation.mutate(amount);
 * };
 *
 * // Use returned Razorpay options:
 * if (paymentOrderMutation.isSuccess && paymentOrderMutation.data?.data) {
 *   const razorpay = new Razorpay(paymentOrderMutation.data.data);
 *   razorpay.open();
 * }
 *
 * if (paymentOrderMutation.isError) {
 *   Alert.alert('Error', 'Failed to create payment order');
 * }
 * ```
 *
 * @example
 * // Complete subscription flow:
 * const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
 * const paymentOrder = usePaymentOption();
 *
 * const handlePayment = () => {
 *   if (!selectedPlan) return;
 *   const amountInPaise = Math.round(parseFloat(selectedPlan.amount) * 100);
 *   paymentOrder.mutate(amountInPaise);
 * };
 *
 * // Open Razorpay on success:
 * useEffect(() => {
 *   if (paymentOrder.data?.data) {
 *     const razorpay = new Razorpay({
 *       ...paymentOrder.data.data,
 *       handler: handlePaymentSuccess
 *     });
 *     razorpay.open();
 *   }
 * }, [paymentOrder.data]);
 *
 * @see {@link https://docs.example.com/subscriptions/payment-order} Payment order API documentation
 * @see {@link useVerifyPayment} For verifying payment after successful checkout
 */
export function usePaymentOption() {
  return useMutation({
    mutationFn: () => http.post<RazorpayOptions>(SubscriptionEndpoints.paymentOrder(), {}),
    onSuccess: (data) => {
      if (data.success) {
        return data.data;
      }
      toast.error(data.message);
      return data.data;
    },
  });
}
