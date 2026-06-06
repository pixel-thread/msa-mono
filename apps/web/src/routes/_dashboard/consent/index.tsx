import { createFileRoute } from '@tanstack/react-router';
import ConsentAdminPage from '@src/features/consent/pages/consent-admin';

export const Route = createFileRoute('/_dashboard/consent/')({
  component: ConsentAdminPage,
});
