export const MEETINGS_KEYS = {
  ALL:       () => ['meetings'] as const,
  LIST:      (page?: number) => ['meetings', page] as const,
  DETAIL:    (id: string) => ['meetings', id] as const,
  ATTENDEES: (meetingId: string) => ['meetings', meetingId, 'attendees'] as const,
  AGENDAS:   (meetingId: string) => ['meetings', meetingId, 'agendas'] as const,
  AGENDA:    (meetingId: string) => ['meetings', meetingId, 'agenda'] as const,
  MINUTES:   (meetingId: string) => ['meetings', meetingId, 'minutes'] as const,
  RSVPS:     (meetingId: string) => ['meetings', meetingId, 'rsvps'] as const,
  RSVP:      (meetingId: string) => ['meetings', meetingId, 'rsvp'] as const,
}
