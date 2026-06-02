export const ADMIN = {
  ASSOCIATIONS: '/admin/associations',
  ASSOCIATION_DETAILS: (id: string) => `/admin/associations/${id}`,
  ASSOCIATION_MEMBER: (id: string) => `/admin/associations/${id}/member`,
  MEMBERSHIP_APPLICATIONS: '/admin/membership-applications',
  MEMBERSHIP_APPLICATION_APPROVE: (id: string) => `/admin/membership-applications/${id}/approve`,
  MEMBERSHIP_APPLICATION_REJECT: (id: string) => `/admin/membership-applications/${id}/reject`,
} as const;
