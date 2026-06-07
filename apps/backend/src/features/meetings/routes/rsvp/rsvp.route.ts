import { ForbiddenError } from '@errors';
import { updateAttendee } from '@feature/meetings/services/updateAttendee';
import { validate } from '@lib/validate';
import { UserRole } from '@prisma/client';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { RequestHandler } from 'express';
import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

const RsvpSchema = z.object({
  status: z.enum(['ACCEPTED', 'DECLINED']),
  note: z
    .string()
    .max(300)
    .optional()
    .transform((v) => v?.trim()),
});

/** POST /api/meetings/[meetingId]/rsvp - Submit an RSVP for a meeting. */
export const postRsvp: RequestHandler[] = [
  validate({ body: RsvpSchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';
    const meetingId = req.params.meetingId as string;
    logger.info({ traceId, meetingId }, 'POST /api/meetings/[meetingId]/rsvp - Request started');

    const user = await withRole(req, UserRole.MEMBER);
    logger.info(
      { traceId, userId: user.id, role: user.role, meetingId },
      'POST /api/meetings/[meetingId]/rsvp - User authorized',
    );

    const userId = req.user?.id as string;
    if (!userId) throw new ForbiddenError('Unauthorized');

    logger.info(
      { traceId, meetingId, userId },
      'POST /api/meetings/[meetingId]/rsvp - Submitting RSVP',
    );

    const updated = await updateAttendee({
      meetingId,
      associationId: req.user!.associationId,
      userId,
      data: {
        rsvpStatus: req.body.status,
        rsvpNote: req.body.note,
      },
    });

    logger.info({ traceId, meetingId }, 'POST /api/meetings/[meetingId]/rsvp - Success');
    return success(res, { data: updated, message: 'RSVP submitted successfully' });
  }),
];
