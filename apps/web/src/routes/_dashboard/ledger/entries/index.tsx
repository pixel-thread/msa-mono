import { createFileRoute } from '@tanstack/react-router';
import { LedgerEntriesPage } from '@src/features/ledger/pages';

export const Route = createFileRoute('/_dashboard/ledger/entries/')({
  component: LedgerEntriesPage,
});
