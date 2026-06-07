// ---------------------------------------------------------------------------
// Constants — API endpoint builders for member-related routes
// ---------------------------------------------------------------------------
export const membersEndpoints = {
  list: (page = 1, status = 'ACTIVE') => `/members?page=${page}&status=${status}`,
  byId: (id: string) => `/members/${id}`,
  status: (id: string) => `/members/${id}/status`,
  role: (id: string) => `/members/${id}/role`,
  types: '/member-types' as const,
  applications: {
    approve: (id: string) => `/admin/membership-applications/${id}/approve`,
    reject: (id: string) => `/admin/membership-applications/${id}/reject`,
  },
} as const;
