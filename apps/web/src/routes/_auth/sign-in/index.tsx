import { SignInPage } from '@feature/auth/pages';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/sign-in/')({
  component: SignInPage,
});
