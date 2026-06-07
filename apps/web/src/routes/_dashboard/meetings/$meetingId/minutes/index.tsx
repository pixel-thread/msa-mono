import { MeetingMinutesPage } from '@src/features/meetings/pages';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/meetings/$meetingId/minutes/')({
  component: MeetingMinutesPage,
});
