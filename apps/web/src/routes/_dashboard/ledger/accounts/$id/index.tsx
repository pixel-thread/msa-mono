import { createFileRoute } from '@tanstack/react-router';
import { LedgerAccountDetailPage } from '@src/features/ledger/pages';

export const Route = createFileRoute('/_dashboard/ledger/accounts/$id')({
  component: LedgerAccountDetailPage,
});
