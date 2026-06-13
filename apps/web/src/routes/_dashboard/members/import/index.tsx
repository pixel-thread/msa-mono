import { MemberImportPage } from '@src/features/members/pages';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/members/import/')({
  component: MemberImportPage,
});
