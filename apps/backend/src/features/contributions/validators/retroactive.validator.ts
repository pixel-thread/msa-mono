import { z } from 'zod';

export const RetroactiveAffectedUsersSchema = z.object({
  planVersionId: z.string().uuid().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
}).refine(
  (data) => data.planVersionId !== undefined || (data.startDate !== undefined && data.endDate !== undefined),
  {
    message: 'Provide either planVersionId or both startDate and endDate',
    path: ['planVersionId'],
  },
);

export type RetroactiveAffectedUsersInput = z.infer<typeof RetroactiveAffectedUsersSchema>;
