export const ANNOUNCEMENTS = {
  ROOT: '/announcements',
  DETAILS: (id: string) => `/announcements/${id}`,
  READ: (id: string) => `/announcements/${id}/read`,
  UPLOAD: (id: string) => `/announcements/${id}/upload`,
} as const;
