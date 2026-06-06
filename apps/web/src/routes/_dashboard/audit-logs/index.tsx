import { createFileRoute } from '@tanstack/react-router';
import AuditLogsPage from '@src/features/audit-logs/pages/audit-logs-page';

export const Route = createFileRoute('/_dashboard/audit-logs/')({
  component: AuditLogsPage,
});
