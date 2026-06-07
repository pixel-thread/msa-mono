import { processAgendaOperations } from '@feature/meetings/services/processAgendaOperations';
import { AgendaOperationSchema } from '@feature/meetings/validators/agenda-items';
import { validate } from '@lib/validate';
import { UserRole } from '@prisma/client';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { RequestHandler } from 'express';
import type { NextFunction, Request, Response } from 'express';

import { MeetingParamsSchema } from '../../validators';

/** PATCH /api/meetings/[meetingId]/agenda - Process bulk agenda operations (create/update/delete/reorder). */
export const patchProcessAgendaOperations: RequestHandler[] = [
  validate({ params: MeetingParamsSchema, body: AgendaOperationSchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';
    const meetingId = req.params.meetingId as string;
    logger.info(
      { traceId, meetingId, associationId: req.user!.associationId },
      'PATCH /api/meetings/[meetingId]/agenda - Request started',
    );

    const user = await withRole(req, UserRole.SECRETARY);
    logger.info(
      { traceId, userId: user.id, role: user.role, meetingId },
      'PATCH /api/meetings/[meetingId]/agenda - User authorized',
    );
    logger.info(
      { traceId, meetingId },
      'PATCH /api/meetings/[meetingId]/agenda - Processing agenda operations',
    );

    const items = await processAgendaOperations({
      meetingId,
      associationId: req.user!.associationId,
      operations: req.body.operations,
    });

    logger.info({ traceId, meetingId }, 'PATCH /api/meetings/[meetingId]/agenda - Success');
    return success(res, { data: items, message: 'Agenda updated successfully' });
  }),
];
