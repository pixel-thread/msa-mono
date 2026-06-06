import { createFileRoute } from '@tanstack/react-router';
import { MemberDetailPage } from '@src/features/members/pages';

export const Route = createFileRoute('/_dashboard/members/$memberId')({
  component: MemberDetailPage,
});
