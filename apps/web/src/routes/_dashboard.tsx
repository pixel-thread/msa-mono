import { Outlet, createFileRoute } from '@tanstack/react-router';
import { DashboardLayout } from '@src/shared/components/dashboard-layout';

export const Route = createFileRoute('/_dashboard')({
  component: DashboardLayoutWrapper,
});

function DashboardLayoutWrapper() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}
