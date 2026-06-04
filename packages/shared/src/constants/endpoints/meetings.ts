export const MEETINGS = {
  MY: '/meetings/my',
  LIST: '/meetings',
  CREATE: '/meetings',
  DETAIL: (id: string) => `/meetings/${id}`,
  UPDATE: (id: string) => `/meetings/${id}`,
  DELETE: (id: string) => `/meetings/${id}`,
  CANCEL: (id: string) => `/meetings/${id}/cancel`,
  NOTICE: (id: string) => `/meetings/${id}/notice`,
  REPORT: (id: string) => `/meetings/${id}/report`,
  RSVP: (id: string) => `/meetings/${id}/rsvp`,

  ATTENDEES: {
    LIST: (id: string) => `/meetings/${id}/attendees`,
    ADD: (id: string) => `/meetings/${id}/attendees`,
    BULK_ASSIGN: (id: string) => `/meetings/${id}/attendees/bulk`,
    BULK_ASSIGN_PUT: (id: string) => `/meetings/${id}/attendees`,
    DETAIL: (meetingId: string, userId: string) => `/meetings/${meetingId}/attendees/${userId}`,
    REMOVE: (meetingId: string, userId: string) => `/meetings/${meetingId}/attendees/${userId}`,
  },

  AGENDA: {
    LIST: (id: string) => `/meetings/${id}/agenda`,
    ADD: (id: string) => `/meetings/${id}/agenda`,
    PROCESS: (id: string) => `/meetings/${id}/agenda`,
    ITEM: (meetingId: string, itemId: string) => `/meetings/${meetingId}/agenda/${itemId}`,
  },

  MINUTES: {
    LIST: (id: string) => `/meetings/${id}/minutes`,
    ADD: (id: string) => `/meetings/${id}/minutes`,
    DETAIL: (meetingId: string, minutesId: string) => `/meetings/${meetingId}/minutes/${minutesId}`,
  },
} as const;
