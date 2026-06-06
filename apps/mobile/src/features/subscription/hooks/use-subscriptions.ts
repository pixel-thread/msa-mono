import http from '@src/shared/utils/http';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS, ENDPOINTS } from '@repo/shared';
import { SubscriptionPlan } from '../types';

/**
 * Fetches all available subscription plans for the association.
 *
 * Retrieves the list of active subscription plans that users can subscribe to.
 * Each plan includes pricing, billing cycle, features, and effective dates.
 *
 * @returns Query result containing the subscription plans
 * @returns {SubscriptionPlan[]} data - Array of subscription plan objects
 * @returns {boolean} isLoading - Whether the query is in loading state
 * @returns {boolean} isError - Whether an error occurred
 * @returns {Error} error - The error object if an error occurred
 *
 * @throws {Error} Network errors or API failures
 *
 * @example
 * ```typescript
 * const { data: plans, isLoading, isError } = useSubscriptionPlans();
 *
 * if (isLoading) return <Spinner />;
 * if (isError) return <ErrorMessage error={error} />;
 *
 * return (
 *   <FlatList
 *     data={plans}
 *     keyExtractor={(item) => item.id}
 *     renderItem={({ item }) => (
 *       <PlanCard
 *         name={item.name}
 *         amount={item.amount}
 *         currency={item.currency}
 *         billingCycle={item.billingCycle}
 *         features={item.features}
 *       />
 *     )}
 *   />
 * );
 * ```
 *
 * @example
 * // Filter active plans only:
 * const { data: plans } = useSubscriptionPlans();
 * const activePlans = plans?.filter(p => p.isActive);
 *
 * // Find plan by billing cycle:
 * const yearlyPlan = plans?.find(p => p.billingCycle === 'YEARLY');
 *
 * @see {@link https://docs.example.com/subscriptions/plans} Subscription plans API documentation
 * @see {@link usePaymentOption} For creating a payment order for a plan
 */
export function useSubscriptionPlans() {
  return useQuery({
    queryKey: QUERY_KEYS.SUBSCRIPTIONS_KEYS.PLANS(),
    queryFn: () => http.get<SubscriptionPlan>(ENDPOINTS.SUBSCRIPTIONS.PLANS),
    select: (data) => data.data,
  });
}

