import { createFileRoute } from '@tanstack/react-router';
import { SignInPage } from '@feature/auth/pages';

export const Route = createFileRoute('/_auth/sign-in/')({
  component: SignInPage,
});
