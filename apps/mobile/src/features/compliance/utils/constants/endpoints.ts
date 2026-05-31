export const complianceEndpoints = {
  submit: '/compliance',
  my: '/compliance/my',
  myDetail: (id: string) => `/compliance/my/${id}`,
  cancel: (id: string) => `/compliance/my/${id}/cancel`,
} as const;
