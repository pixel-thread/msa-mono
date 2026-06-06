import { createFileRoute } from '@tanstack/react-router';
import { LedgerEntryDetailPage } from '@src/features/ledger/pages';

export const Route = createFileRoute('/_dashboard/ledger/entries/$entryId/')({
  component: LedgerEntryDetailPage,
});
