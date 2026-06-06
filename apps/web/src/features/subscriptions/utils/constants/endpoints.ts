export const subscriptionEndpoints = {
  plans: '/subscriptions/plans' as const,
  plansList: (page: number = 1) => `/subscriptions/plans?page=${page}`,
  planById: (id: string) => `/subscriptions/plans/${id}`,
  default: '/subscriptions/plans/default' as const,
  my: '/subscriptions/my' as const,
  myList: (page: number = 1) => `/subscriptions/my?page=${page}`,
  subscribe: '/subscriptions/subscribe' as const,
  upgrade: '/subscriptions/upgrade' as const,
  waive: '/subscriptions/waive' as const,
  userSubscription: (userId: string) => `/subscriptions/user/${userId}`,
} as const;
