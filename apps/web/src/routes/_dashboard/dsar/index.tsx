import { DsarAdminPage } from '@src/features/dsar/pages';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/dsar/')({
  component: DsarAdminPage,
});
