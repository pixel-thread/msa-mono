import { DashboardPage } from '@src/features/dashboard/pages';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/dashboard/')({
  component: DashboardPage,
});
