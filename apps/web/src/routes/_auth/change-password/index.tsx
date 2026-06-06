import { createFileRoute } from '@tanstack/react-router';
import { ChangePasswordPage } from '@feature/auth/pages';

export const Route = createFileRoute('/_auth/change-password/')({
  component: ChangePasswordPage,
});
