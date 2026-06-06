import { createFileRoute } from '@tanstack/react-router';
import { DsarAdminPage } from '@src/features/dsar/pages';

export const Route = createFileRoute('/_dashboard/dsar/')({
  component: DsarAdminPage,
});
