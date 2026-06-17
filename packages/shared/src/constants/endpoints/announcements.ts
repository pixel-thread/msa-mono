export const ANNOUNCEMENTS = {
  LIST: '/announcements',
  DETAILS: (id: string) => `/announcements/${id}`,
  READ: (id: string) => `/announcements/${id}/read`,
  UPLOAD: (id: string) => `/announcements/${id}/upload`,
} as const;
