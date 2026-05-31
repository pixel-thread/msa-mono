export const SubscriptionEndpoints = {
  list: () => `/subscriptions`,
  plans: () => `/subscriptions/plans`,
  paymentHistory: () => `/payments/history`,
  paymentOrder: () => `/payments/order`,
  verifyPayment: () => `/payments/verify`,
} as const;
