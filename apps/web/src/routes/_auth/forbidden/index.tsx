import { ForbiddenPage } from '@feature/auth/pages';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/forbidden/')({
  component: ForbiddenPage,
});
