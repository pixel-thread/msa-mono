import { AssociationsPage } from '@src/features/associations/pages';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/associations/')({
  component: AssociationsPage,
});
