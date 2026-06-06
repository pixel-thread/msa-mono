export const SUBSCRIPTIONS_KEYS = {
  ALL:             () => ['subscriptions'] as const,
  PLANS:           (page?: number) => ['subscription-plans', page] as const,
  PLAN:            (id: string) => ['plan', id] as const,
  MY:              (page?: number) => ['my-subscription', page] as const,
  USER:            (userId: string) => ['user-subscription', userId] as const,
  PAYMENT_HISTORY: (page?: number) => ['payment-history', page] as const,
}
