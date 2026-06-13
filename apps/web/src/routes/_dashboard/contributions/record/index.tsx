import { RecordContributionPage } from '@src/features/contributions/pages/record-contribution';
import { createFileRoute } from '@tanstack/react-router';
import z from 'zod';

const RecordContributionRouteQuerySchema = z.object({
  member: z.uuid('Invalid Member').optional(),
  page: z.number().positive().default(1),
});
export const Route = createFileRoute('/_dashboard/contributions/record/')({
  component: RecordContributionPage,
  validateSearch: RecordContributionRouteQuerySchema,
});
