import { createFileRoute } from '@tanstack/react-router';
import { AssociationsPage } from '@src/features/associations/pages';

export const Route = createFileRoute('/_dashboard/associations/')({
  component: AssociationsPage,
});
