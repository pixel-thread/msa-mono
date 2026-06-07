import { ForbiddenError } from '@errors';
import { createMeeting } from '@feature/meetings/services';
import { CreateMeetingSchema } from '@feature/meetings/validators/meetings';
import { validate } from '@lib/validate';
import { UserRole } from '@prisma/client';
import { getAssociation } from '@services/association/get-association';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import { hasHighRoleAccess } from '@utils/has-high-role';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { RequestHandler } from 'express';
import type { NextFunction, Request, Response } from 'express';

/** POST /api/meetings - Create a new meeting with agenda items. */
export const postCreateMeeting: RequestHandler[] = [
  validate({ body: CreateMeetingSchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';
    const association = await getAssociation(req);
    logger.info({ traceId, associationId: association.id }, 'POST /api/meetings - Request started');

    const userId = req.user?.id as string;
    const user = await withRole(req, UserRole.SECRETARY);

    if (!hasHighRoleAccess(user.role)) {
      throw new ForbiddenError('Only secretary, president, or super admin can create meetings');
    }

    logger.info(
      { traceId, userId: user.id, role: user.role },
      'POST /api/meetings - User authorized',
    );
    logger.info({ traceId }, 'POST /api/meetings - Creating meeting');

    const meeting = await createMeeting({
      associationId: association.id,
      createdById: userId,
      data: {
        title: req.body.title,
        type: req.body.type,
        scheduledAt: new Date(req.body.scheduledAt),
        venue: req.body.venue,
        agendaItems: req.body.agendaItems?.map((item: any, idx: number) => ({
          ...item,
          order: item.order ?? idx + 1,
        })),
      },
    });

    logger.info({ traceId, meetingId: meeting.id }, 'POST /api/meetings - Success');
    return success(res, { data: meeting }, 201);
  }),
];
