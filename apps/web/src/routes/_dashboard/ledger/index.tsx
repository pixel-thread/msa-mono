import { createFileRoute } from '@tanstack/react-router';
import { LedgerDashboardPage } from '@src/features/ledger/pages';

export const Route = createFileRoute('/_dashboard/ledger/')({
  component: LedgerDashboardPage,
});
