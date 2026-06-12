import http from '@src/shared/utils/http';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS, ENDPOINTS } from '@repo/shared';
import { PaymentSummary, Transaction } from '../types/payment';

type PaymentHistory = {
  transactions: Transaction[];
  summary: PaymentSummary;
};

/**
 * Fetches the payment and transaction history for the authenticated user.
 *
 * Retrieves the complete history of payments and transactions including
 * summary statistics showing expected, paid, and due amounts.
 * Useful for displaying user's financial overview and payment records.
 *
 * @returns Query result containing payment history and summary
 * @returns {object} data - Payment history object
 * @returns {Transaction[]} data.transactions - Array of transaction records
 * @returns {PaymentSummary} data.summary - Financial summary with totals
 * @returns {boolean} isLoading - Whether the query is in loading state
 * @returns {boolean} isError - Whether an error occurred
 * @returns {Error} error - The error object if an error occurred
 *
 * @throws {Error} Network errors or API failures
 * @throws {Error} Unauthorized access
 *
 * @example
 * ```typescript
 * const { data: paymentHistory, isLoading, isError } = usePaymentHistory();
 *
 * if (isLoading) return <Spinner />;
 * if (isError) return <ErrorMessage error={error} />;
 *
 * const { transactions, summary } = paymentHistory;
 *
 * return (
 *   <View>
 *     <PaymentSummaryCard
 *       totalExpected={summary.totalExpected}
 *       totalPaid={summary.totalPaid}
 *       totalDue={summary.totalDue}
 *       overdueMonths={summary.overdueMonths}
 *     />
 *     <FlatList
 *       data={transactions}
 *       keyExtractor={(item) => item.id}
 *       renderItem={({ item }) => (
 *         <TransactionCard
 *           amount={item.amount}
 *           status={item.status}
 *           paymentDate={item.paymentDate}
 *           allocations={item.allocations}
 *         />
 *       )}
 *     />
 *   </View>
 * );
 * ```
 *
 * @example
 * // Display payment status indicators:
 * const { data } = usePaymentHistory();
 *
 * const getStatusColor = (status: PaymentStatus) => {
 *   switch (status) {
 *     case 'PAID': return 'green';
 *     case 'PENDING': return 'yellow';
 *     case 'FAILED': return 'red';
 *   }
 * };
 *
 * // Calculate total paid this year:
 * const thisYearTransactions = data?.transactions.filter(t =>
 *   new Date(t.paymentDate).getFullYear() === new Date().getFullYear()
 * );
 * const totalPaidThisYear = thisYearTransactions?.reduce(
 *   (sum, t) => sum + (t.status === 'PAID' ? t.amount : 0), 0
 * );
 *
 * @see {@link https://docs.example.com/subscriptions/payment-history} Payment history API documentation
 * @see {@link useSubscriptionPlans} For viewing available subscription plans
 * @see {@link useVerifyPayment} For confirming new payments
 */
export function usePaymentHistory() {
  return useQuery({
    queryKey: QUERY_KEYS.SUBSCRIPTIONS_KEYS.PAYMENT_HISTORY(),
    queryFn: async () => http.get<PaymentHistory>(ENDPOINTS.PAYMENTS.HISTORY),
    select: (data) => data.data,
  });
}
