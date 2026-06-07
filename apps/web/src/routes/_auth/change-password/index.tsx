import { ChangePasswordPage } from '@feature/auth/pages';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/change-password/')({
  component: ChangePasswordPage,
});
