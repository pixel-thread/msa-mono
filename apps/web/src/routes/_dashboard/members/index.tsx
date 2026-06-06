import { createFileRoute } from '@tanstack/react-router';
import { MembersPage } from '@src/features/members/pages';

export const Route = createFileRoute('/_dashboard/members/')({
  component: MembersPage,
});
