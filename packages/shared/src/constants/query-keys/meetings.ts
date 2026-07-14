type Args = string | number | boolean | null | undefined;
export const MEETINGS_KEYS = {
  ALL: () => ['meetings'].filter(Boolean),
  LISTS: () => ['meetings'].filter(Boolean),
  LIST: (...args: Args[]) => ['meetings', ...args].filter(Boolean),
  DETAIL: (id: string) => ['meetings', id].filter(Boolean),
  ATTENDEES: (meetingId: string) => ['meetings', meetingId, 'attendees'].filter(Boolean),
  AGENDAS: (meetingId: string) => ['meetings', meetingId, 'agendas'].filter(Boolean),
  AGENDA: (meetingId: string) => ['meetings', meetingId, 'agenda'].filter(Boolean),
  MINUTES: (meetingId: string) => ['meetings', meetingId, 'minutes'].filter(Boolean),
  RSVPS: (meetingId: string) => ['meetings', meetingId, 'rsvps'].filter(Boolean),
  RSVP: (meetingId: string) => ['meetings', meetingId, 'rsvp'].filter(Boolean),
};
