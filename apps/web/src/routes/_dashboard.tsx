import { DashboardLayout } from '@src/shared/components/dashboard-layout';
import { createFileRoute,Outlet } from '@tanstack/react-router';

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
