export const SUBSCRIPTIONS = {
  PLANS: '/api/v1/subscriptions/plans',
  PLAN_DETAILS: (id: string) => `/api/v1/subscriptions/plans/${id}`,
  MY: '/api/v1/subscriptions/my',
  SUBSCRIBE: '/api/v1/subscriptions/subscribe',
  UPGRADE: '/api/v1/subscriptions/upgrade',
  WAIVE: '/api/v1/subscriptions/waive',
  PAYMENTS: (id: string) => `/api/v1/subscriptions/${id}/payments`,
} as const;
