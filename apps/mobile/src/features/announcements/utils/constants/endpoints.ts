export const announcementEndpoints = {
  list: '/announcements',
  detail: (id: string) => `/announcements/${id}`,
  markReadAnnouncement: (id: string) => `/announcements/${id}/read`,
} as const;
