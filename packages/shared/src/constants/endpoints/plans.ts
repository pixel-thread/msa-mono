export const PLANS = {
  PLANS: "/plans",
  PLANS_DEFAULT: "/plans/default",
  PLAN_DETAILS: (id: string) => `/plans/${id}`,
} as const;
