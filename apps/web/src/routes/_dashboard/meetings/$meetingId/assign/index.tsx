import { createFileRoute } from '@tanstack/react-router';
import { AssignMembersPage } from '@src/features/meetings/pages';

export const Route = createFileRoute('/_dashboard/meetings/$meetingId/assign/')({
  component: AssignMembersPage,
});
