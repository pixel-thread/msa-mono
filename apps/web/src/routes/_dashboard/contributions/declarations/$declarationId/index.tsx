import { createFileRoute } from '@tanstack/react-router';
import { DeclarationDetailPage } from '@src/features/contributions/pages/declaration-detail';

export const Route = createFileRoute('/_dashboard/contributions/declarations/$declarationId/')({
  component: DeclarationDetailPage,
});
