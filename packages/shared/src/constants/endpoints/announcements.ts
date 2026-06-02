export const ANNOUNCEMENTS = {
  ROOT: '/api/v1/announcements',
  DETAILS: (id: string) => `/api/v1/announcements/${id}`,
  READ: (id: string) => `/api/v1/announcements/${id}/read`,
  UPLOAD: (id: string) => `/api/v1/announcements/${id}/upload`,
} as const;
