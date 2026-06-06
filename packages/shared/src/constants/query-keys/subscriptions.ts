export const SUBSCRIPTIONS_KEYS = {
  ALL:             () => ['subscriptions'].filter(Boolean),
  PLANS:           (page?: number) => ['subscription-plans', page].filter(Boolean),
  PLAN:            (id: string) => ['plan', id].filter(Boolean),
  MY:              (page?: number) => ['my-subscription', page].filter(Boolean),
  USER:            (userId: string) => ['user-subscription', userId].filter(Boolean),
  PAYMENT_HISTORY: (page?: number) => ['payment-history', page].filter(Boolean),
}
