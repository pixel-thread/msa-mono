import { LedgerAccountDetailPage } from '@src/features/ledger/pages';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/ledger/accounts/$id/')({
  component: LedgerAccountDetailPage,
});
