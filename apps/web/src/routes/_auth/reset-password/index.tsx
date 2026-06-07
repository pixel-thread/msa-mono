import { ResetPasswordPage } from '@feature/auth/pages';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/reset-password/')({
  component: ResetPasswordPage,
});
