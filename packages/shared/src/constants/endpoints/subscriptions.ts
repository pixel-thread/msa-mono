export const SUBSCRIPTIONS = {
  PLANS: "/subscriptions/plans",
  PLANS_DEFAULT: "/subscriptions/plans/default",
  PLAN_DETAILS: (id: string) => `/subscriptions/plans/${id}`,
  MY: "/subscriptions/my",
  SUBSCRIBE: "/subscriptions/subscribe",
  UPGRADE: "/subscriptions/upgrade",
  WAIVE: "/subscriptions/waive",
  PAYMENTS: (id: string) => `/subscriptions/${id}/payments`,
  USER: (id: string) => `/subscriptions/user/${id}`,
} as const;
