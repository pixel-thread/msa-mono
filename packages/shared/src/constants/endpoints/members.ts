export const MEMBERS = {
  ROOT: '/api/v1/members',
  DETAILS: (id: string) => `/api/v1/members/${id}`,
  STATUS: (id: string) => `/api/v1/members/${id}/status`,
  SUSPEND: (id: string) => `/api/v1/members/${id}/suspend`,
  ROLE: (id: string) => `/api/v1/members/${id}/role`,
  LEDGER: (id: string) => `/api/v1/members/${id}/ledger`,
  ONBOARDING: '/api/v1/members/onboarding',
} as const;
