import { createMeetingMinute } from '@feature/meetings/services/minutes';
import { CreateMeetingMinuteSchema } from '@feature/meetings/validators/minutes';
import { validate } from '@lib/validate';
import { UserRole } from '@prisma/client';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { RequestHandler } from 'express';
import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

const ParamsSchema = z.object({
  meetingId: z.string('Invalid meeting ID'),
});

/** POST /api/meetings/[meetingId]/minutes - Record a meeting minute. */
export const postCreateMinute: RequestHandler[] = [
  validate({ params: ParamsSchema, body: CreateMeetingMinuteSchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';
    const meetingId = req.params.meetingId as string;
    logger.info(
      { traceId, meetingId, associationId: req.user!.associationId },
      'POST /api/meetings/[meetingId]/minutes - Request started',
    );

    const user = await withRole(req, UserRole.SECRETARY);
    logger.info(
      { traceId, userId: user.id, role: user.role, meetingId },
      'POST /api/meetings/[meetingId]/minutes - User authorized',
    );
    logger.info(
      { traceId, meetingId },
      'POST /api/meetings/[meetingId]/minutes - Creating meeting minute',
    );

    const minute = await createMeetingMinute({
      meetingId,
      associationId: req.user!.associationId,
      data: req.body,
    });

    logger.info({ traceId, meetingId }, 'POST /api/meetings/[meetingId]/minutes - Success');
    return success(res, { data: minute, message: 'Meeting minute recorded successfully' });
  }),
];
