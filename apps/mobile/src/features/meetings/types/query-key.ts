import { MeetingQueryKeys } from '@features/meetings/utils/constants/query-key';

export type MeetingQueryKey =
  | ReturnType<typeof MeetingQueryKeys.all>
  | ReturnType<typeof MeetingQueryKeys.detail>
  | ReturnType<typeof MeetingQueryKeys.agendas>
  | ReturnType<typeof MeetingQueryKeys.agenda>
  | ReturnType<typeof MeetingQueryKeys.attendees>
  | ReturnType<typeof MeetingQueryKeys.rsvps>
  | ReturnType<typeof MeetingQueryKeys.rsvp>
  | ReturnType<typeof MeetingQueryKeys.minutes>;
