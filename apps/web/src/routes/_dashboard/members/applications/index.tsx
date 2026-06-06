import { createFileRoute } from '@tanstack/react-router';
import { MembershipApplicationsPage } from '@src/features/membership-applications/pages/applications';

export const Route = createFileRoute('/_dashboard/members/applications/')({
  component: MembershipApplicationsPage,
});
