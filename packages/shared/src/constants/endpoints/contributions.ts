export const CONTRIBUTION = {
  DECLARATIONS: "/contributions/declarations",
  LIST_DECLARATIONS: "/contributions/declarations",
  LIST_ALL_DECLARATIONS: "/contributions/declarations",
  APPROVE_DECLARATION: (id: string) =>
    `/contributions/declarations/${id}/approve`,
  REJECT_DECLARATION: (id: string) =>
    `/contributions/declarations/${id}/reject`,
  CREATE_PAYMENT: "/contributions/payments",
  VERIFY_PAYMENT: (id: string) => `/contributions/payments/${id}/verify`,
};
