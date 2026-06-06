import { createFileRoute } from '@tanstack/react-router';
import ComplianceAdminPage from '@src/features/compliance/pages/compliance-admin';

export const Route = createFileRoute('/_dashboard/compliance/')({
  component: ComplianceAdminPage,
});
