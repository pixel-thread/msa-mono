import { createFileRoute } from '@tanstack/react-router';
import { ForbiddenPage } from '@feature/auth/pages';

export const Route = createFileRoute('/_auth/forbidden')({
  component: ForbiddenPage,
});
