export const ADMIN = {
  ASSOCIATIONS: '/api/v1/admin/associations',
  ASSOCIATION_DETAILS: (id: string) => `/api/v1/admin/associations/${id}`,
  ASSOCIATION_MEMBER: (id: string) => `/api/v1/admin/associations/${id}/member`,
  MEMBERSHIP_APPLICATIONS: '/api/v1/admin/membership-applications',
  MEMBERSHIP_APPLICATION_APPROVE: (id: string) => `/api/v1/admin/membership-applications/${id}/approve`,
  MEMBERSHIP_APPLICATION_REJECT: (id: string) => `/api/v1/admin/membership-applications/${id}/reject`,
} as const;
