import { Request, NextFunction, Response } from 'express';
import type { RequestHandler } from 'express';
import { validate } from '@lib/validate';
import { success } from '@utils/responses';
import { UserRole } from '@prisma/client';
import { processAgendaOperations } from '@feature/meetings/services/processAgendaOperations';
import {
  AgendaOperationSchema,
  ProcessingAgendaParamsSchema,
} from '@feature/meetings/validators/agenda-items';
import { logger } from '@src/shared/logger';
import { getAssociation } from '@services/association/get-association';
import { withRole } from '@utils/with-role';
import { asyncHandler } from '@utils/async-handler';

/** PATCH /api/meetings/[meetingId]/agenda - Process bulk agenda operations (create/update/delete/reorder). */
export const patchProcessAgendaOperations: RequestHandler[] = [
  validate({ params: ProcessingAgendaParamsSchema, body: AgendaOperationSchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';
    const association = await getAssociation(req);
    const meetingId = req.params.meetingId as string;
    logger.info(
      { traceId, meetingId, associationId: association.id },
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
      associationId: association.id,
      operations: req.body.operations,
    });

    logger.info({ traceId, meetingId }, 'PATCH /api/meetings/[meetingId]/agenda - Success');
    return success(res, { data: items, message: 'Agenda updated successfully' });
  }),
];
