import { createFileRoute } from '@tanstack/react-router';
import { MemberTypesPage } from '@src/features/member-type/pages';

export const Route = createFileRoute('/_dashboard/member-types')({
  component: MemberTypesPage,
});
