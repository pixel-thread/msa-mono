import { createFileRoute } from '@tanstack/react-router';
import { ApplicationsPage } from '@src/features/membership-applications/pages';

export const Route = createFileRoute('/_dashboard/members/applications')({
  component: ApplicationsPage,
});
