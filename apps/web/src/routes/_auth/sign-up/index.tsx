import { createFileRoute } from '@tanstack/react-router';
import { SignUpPage } from '@feature/auth/pages';

export const Route = createFileRoute('/_auth/sign-up')({
  component: SignUpPage,
});
