import { MembershipApplicationsPage } from '@src/features/membership-applications/pages/applications';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/members/applications/')({
  component: MembershipApplicationsPage,
});
