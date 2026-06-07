import AuditLogsPage from '@src/features/audit-logs/pages/audit-logs-page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/audit-logs/')({
  component: AuditLogsPage,
});
