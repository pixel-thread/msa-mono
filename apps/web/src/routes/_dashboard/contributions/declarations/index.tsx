import { createFileRoute } from '@tanstack/react-router';
import { DeclarationsPage } from '@src/features/contributions/pages';

export const Route = createFileRoute('/_dashboard/contributions/declarations/')({
  component: DeclarationsPage,
});
