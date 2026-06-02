export const COMPLIANCE = {
  LIST: '/api/v1/compliance',
  CREATE: '/api/v1/compliance',
  CHECKS: '/api/v1/compliance/checks',
  CHECK_DETAIL: (checkId: string) => `/api/v1/compliance/checks/${checkId}`,
  EVIDENCE: '/api/v1/compliance/evidence',
  MY_LIST: '/api/v1/compliance/my',
  MY_DETAIL: (complaintId: string) => `/api/v1/compliance/my/${complaintId}`,
} as const;
