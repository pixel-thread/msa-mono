export const MeetingQueryKeys = {
  all: (page?: number) => ['meetings', page] as const,
  detail: (id: string) => ['meetings', id] as const,
  agendas: (id: string) => ['meetings', id, 'agendas'] as const,
  agenda: (id: string) => ['meetings', id, 'agenda'] as const,
  attendees: (id: string) => ['meetings', id, 'attendees'] as const,
  rsvps: (id: string) => ['meetings', id, 'rsvps'] as const,
  rsvp: (id: string) => ['meetings', id, 'rsvp'] as const,
  minutes: (meetingId: string) => ['meetings', meetingId, 'minutes'] as const,
};
