import { LedgerDashboardPage } from '@src/features/ledger/pages';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/ledger/')({
  component: LedgerDashboardPage,
});
