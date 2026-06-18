export const PLANS = {
  PLANS: '/plans',
  PLAN_VERSIONS: (id: string) => `/plans/${id}/versions`,
  PLANS_DEFAULT: '/plans/default',
  PLAN_DETAILS: (id: string) => `/plans/${id}`,
} as const;
