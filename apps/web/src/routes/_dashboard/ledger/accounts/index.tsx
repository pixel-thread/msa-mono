import { createFileRoute } from '@tanstack/react-router';
import { LedgerAccountsPage } from '@src/features/ledger/pages';

export const Route = createFileRoute('/_dashboard/ledger/accounts/')({
  component: LedgerAccountsPage,
});
