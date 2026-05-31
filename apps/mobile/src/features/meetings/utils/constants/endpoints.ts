export const meetingEndpoints = {
  list: (page?: number) => `/meetings?page=${page}`,
  detail: (id: string) => `/meetings/${id}`,
  agenda: (id: string) => `/meetings/${id}/agenda`,
  attendees: (id: string) => `/meetings/${id}/attendees`,
  minutes: (meetingId: string) => `/meetings/${meetingId}/minutes`,
  minute: (meetingId: string, minuteId: string) => `/meetings/${meetingId}/minutes/${minuteId}`,
  rsvp: (id: string) => `/meetings/${id}/rsvp`,
} as const;
