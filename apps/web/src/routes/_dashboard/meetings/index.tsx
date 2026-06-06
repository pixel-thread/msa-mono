import { createFileRoute } from '@tanstack/react-router';
import { MeetingsPage } from '@src/features/meetings/pages';

export const Route = createFileRoute('/_dashboard/meetings/')({
  component: MeetingsPage,
});
