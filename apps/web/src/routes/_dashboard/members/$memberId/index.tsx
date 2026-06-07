import { MemberDetailPage } from '@src/features/members/pages';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/members/$memberId/')({
  component: MemberDetailPage,
});
