import { createFileRoute } from '@tanstack/react-router';
import { ResetPasswordPage } from '@feature/auth/pages';

export const Route = createFileRoute('/_auth/reset-password/')({
  component: ResetPasswordPage,
});
