import { updateAgendaItem } from '@feature/meetings/services/updateAgendaItem';
import { validate } from '@lib/validate';
import { UserRole } from '@prisma/client';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { RequestHandler } from 'express';
import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

const UpdateAgendaItemSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  order: z.number().int().optional(),
});

/** PATCH /api/meetings/[meetingId]/agenda/[itemId] - Update an agenda item. */
export const patchUpdateAgendaItem: RequestHandler[] = [
  validate({ body: UpdateAgendaItemSchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';
    logger.info(
      { traceId, associationId: req.user!.associationId },
      'PATCH /api/meetings/[meetingId]/agenda/[itemId] - Request started',
    );

    const user = await withRole(req, UserRole.SECRETARY);
    logger.info(
      { traceId, userId: user.id, role: user.role },
      'PATCH /api/meetings/[meetingId]/agenda/[itemId] - User authorized',
    );

    const itemId = req.params.itemId as string;
    logger.info(
      { traceId, itemId },
      'PATCH /api/meetings/[meetingId]/agenda/[itemId] - Updating agenda item',
    );

    const item = await updateAgendaItem({
      where: { id: itemId },
      data: req.body,
    });

    logger.info({ traceId, itemId }, 'PATCH /api/meetings/[meetingId]/agenda/[itemId] - Success');
    return success(res, { data: item });
  }),
];
