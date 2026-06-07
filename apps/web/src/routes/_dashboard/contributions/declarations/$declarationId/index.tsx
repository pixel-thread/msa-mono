import { DeclarationDetailPage } from '@src/features/contributions/pages/declaration-detail';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/contributions/declarations/$declarationId/')({
  component: DeclarationDetailPage,
});
