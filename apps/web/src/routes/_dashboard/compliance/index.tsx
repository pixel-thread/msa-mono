import ComplianceAdminPage from '@src/features/compliance/pages/compliance-admin';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/compliance/')({
  component: ComplianceAdminPage,
});
