import { createFileRoute } from '@tanstack/react-router';
import { LedgerReportsPage } from '@src/features/ledger/pages';

export const Route = createFileRoute('/_dashboard/ledger/reports/')({
  component: LedgerReportsPage,
});
