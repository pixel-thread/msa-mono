import { LedgerAccountsPage } from '@src/features/ledger/pages';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/ledger/accounts/')({
  component: LedgerAccountsPage,
});
