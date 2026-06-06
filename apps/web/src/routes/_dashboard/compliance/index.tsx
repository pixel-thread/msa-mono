import { createFileRoute } from '@tanstack/react-router';
import { CompliancePage } from '@src/features/compliance/pages';

export const Route = createFileRoute('/_dashboard/compliance')({
  component: CompliancePage,
});
