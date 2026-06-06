import { createFileRoute } from '@tanstack/react-router';
import { MeetingDetailPage } from '@src/features/meetings/pages';

export const Route = createFileRoute('/_dashboard/meetings/$meetingId')({
  component: MeetingDetailPage,
});
