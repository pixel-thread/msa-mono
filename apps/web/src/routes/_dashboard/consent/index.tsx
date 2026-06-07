import ConsentAdminPage from '@src/features/consent/pages/consent-admin';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/consent/')({
  component: ConsentAdminPage,
});
