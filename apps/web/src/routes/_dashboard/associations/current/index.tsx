import { createFileRoute } from '@tanstack/react-router';
import { AssociationDetailPage } from '@src/features/associations/pages';

export const Route = createFileRoute('/_dashboard/associations/current/')({
  component: AssociationDetailPage,
});
