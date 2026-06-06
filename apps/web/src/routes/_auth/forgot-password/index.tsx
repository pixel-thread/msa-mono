import { createFileRoute } from '@tanstack/react-router';
import { ForgotPasswordPage } from '@feature/auth/pages';

export const Route = createFileRoute('/_auth/forgot-password/')({
  component: ForgotPasswordPage,
});
