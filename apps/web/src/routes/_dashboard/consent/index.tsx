import { createFileRoute } from '@tanstack/react-router';
import { ConsentPage } from '@src/features/consent/pages';

export const Route = createFileRoute('/_dashboard/consent')({
  component: ConsentPage,
});
