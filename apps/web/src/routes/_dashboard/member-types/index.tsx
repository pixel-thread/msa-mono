import { MemberTypesPage } from '@src/features/member-type/pages';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/member-types/')({
  component: MemberTypesPage,
});
