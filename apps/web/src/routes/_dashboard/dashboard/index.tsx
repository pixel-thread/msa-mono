import { createFileRoute } from '@tanstack/react-router';
import { DashboardPage } from '@src/features/dashboard/pages';

export const Route = createFileRoute('/_dashboard/dashboard/')({
  component: DashboardPage,
});
