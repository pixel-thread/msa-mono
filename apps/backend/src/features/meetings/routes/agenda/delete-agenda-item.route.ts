import { deleteAgendaItem } from '@feature/meetings/services/deleteAgendaItem';
import { UserRole } from '@prisma/client';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { NextFunction, Request, RequestHandler, Response } from 'express';

/** DELETE /api/meetings/[meetingId]/agenda/[itemId] - Delete an agenda item. */
export const deleteAgendaItemHandler: RequestHandler[] = [
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';
    logger.info(
      { traceId, associationId: req.user!.associationId },
      'DELETE /api/meetings/[meetingId]/agenda/[itemId] - Request started',
    );

    const user = await withRole(req, UserRole.SECRETARY);
    logger.info(
      { traceId, userId: user.id, role: user.role },
      'DELETE /api/meetings/[meetingId]/agenda/[itemId] - User authorized',
    );

    const itemId = req.params.itemId as string;
    logger.info(
      { traceId, itemId },
      'DELETE /api/meetings/[meetingId]/agenda/[itemId] - Deleting agenda item',
    );

    const item = await deleteAgendaItem({ where: { id: itemId } });

    logger.info({ traceId, itemId }, 'DELETE /api/meetings/[meetingId]/agenda/[itemId] - Success');
    return success(res, { data: item });
  }),
];
