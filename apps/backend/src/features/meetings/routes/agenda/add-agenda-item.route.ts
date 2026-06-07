import { countAgendaItems } from '@feature/meetings/services/countAgendaItems';
import { createAgendaItem } from '@feature/meetings/services/createAgendaItem';
import { CreateAgendaItemSchema } from '@feature/meetings/validators/agenda-items';
import { validate } from '@lib/validate';
import { UserRole } from '@prisma/client';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { RequestHandler } from 'express';
import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

const ParamsSchema = z.object({ meetingId: z.string('Invalid meeting ID') });

/** POST /api/meetings/[meetingId]/agenda - Create a new agenda item for a meeting. */
export const postAddAgendaItem: RequestHandler[] = [
  validate({ params: ParamsSchema, body: CreateAgendaItemSchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';
    const meetingId = req.params.meetingId as string;
    logger.info({ traceId, meetingId }, 'POST /api/meetings/[meetingId]/agenda - Request started');

    const user = await withRole(req, UserRole.SECRETARY);
    logger.info(
      { traceId, userId: user.id, role: user.role, meetingId },
      'POST /api/meetings/[meetingId]/agenda - User authorized',
    );

    logger.info(
      { traceId, meetingId },
      'POST /api/meetings/[meetingId]/agenda - Creating agenda item',
    );

    let order = req.body.order;
    if (order === undefined) {
      const count = await countAgendaItems({ meetingId });
      order = count + 1;
    }

    const item = await createAgendaItem({
      meetingId,
      title: req.body.title,
      description: req.body.description,
      order,
    });

    logger.info(
      { traceId, meetingId, agendaItemId: item.id },
      'POST /api/meetings/[meetingId]/agenda - Success',
    );
    return success(res, { data: item, message: 'Agenda item created successfully' });
  }),
];
