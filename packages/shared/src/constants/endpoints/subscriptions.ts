export const SUBSCRIPTIONS = {
  PLANS: '/subscriptions/plans',
  PLAN_DETAILS: (id: string) => `/subscriptions/plans/${id}`,
  MY: '/subscriptions/my',
  SUBSCRIBE: '/subscriptions/subscribe',
  UPGRADE: '/subscriptions/upgrade',
  WAIVE: '/subscriptions/waive',
  PAYMENTS: (id: string) => `/subscriptions/${id}/payments`,
} as const;
