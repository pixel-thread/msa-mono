export const CONTRIBUTION = {
  DECLARATIONS: "/contributions/declarations",
  DECLARATION: (id: string) => `/contributions/declarations/${id}`,
  ALL_DECLARATIONS: "/contributions/all-declarations",
  APPROVE_DECLARATION: (id: string) =>
    `/contributions/declarations/${id}/approve`,
  REJECT_DECLARATION: (id: string) =>
    `/contributions/declarations/${id}/reject`,

  LIST: "/contributions",
  GENERATE: "/contributions/generate-periodic",
  WAIVE: "/contributions/waive",
  DETAIL: (id: string) => `/contributions/${id}`,

  USER: (userId: string) => `/contributions/users/${userId}`,

  CREATE_PAYMENT: "/contributions/record",
} as const;
