import { createFileRoute } from '@tanstack/react-router';
import { MeetingMinutesPage } from '@src/features/meetings/pages';

export const Route = createFileRoute('/_dashboard/meetings/$meetingId/minutes/')({
  component: MeetingMinutesPage,
});
