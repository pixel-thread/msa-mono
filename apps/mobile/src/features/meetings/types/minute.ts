export interface MeetingMinute {
  id: string;
  agendaPoint: string;
  meetingId: string;
  decision: string;
  actionItems?: any[] | null;
  recordedAt: string;
}
