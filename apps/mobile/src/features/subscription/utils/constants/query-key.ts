export const SubscriptionQueryKeys = {
  all: () => ['subscriptions'] as const,
  plans: () => ['subscriptions', 'plans'] as const,
  paymentHistory: () => ['payment', 'history'] as const,
} as const;