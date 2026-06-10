import { BadRequestError, NotFoundError } from '@errors';
import {
  assignDsarTicket,
  deleteDsarTicket,
  findUniqueDsarTicket,
  respondToDsarTicket,
} from '@feature/dsar/services';
import {
  AssignDsarSchema,
  DsarTicketParamsSchema,
  RejectDsarSchema,
  RespondDsarSchema,
} from '@feature/dsar/validators';
import { prisma } from '@lib/prisma';
import { validate } from '@lib/validate';
import { DsarStatus, UserRole } from '@prisma/client';
import { findUniqueUser } from '@services/user/get-unique-user';
import { logger } from '@src/shared/logger';
import { withRole } from '@src/shared/utils/with-role';
import { asyncHandler } from '@utils/async-handler';
import { hasHighRoleAccess } from '@utils/has-high-role';
import { success } from '@utils/responses';
import type { RequestHandler } from 'express';
import type { NextFunction, Request, Response } from 'express';

/** GET /api/dsar/:ticketId - Retrieve a single DSAR ticket (owner or DPO role required). */
export const getTicket: RequestHandler[] = [
  validate({ params: DsarTicketParamsSchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';
    const userId = req.user?.id as string;
    const ticketId = req.params.ticketId as string;

    logger.info(
      { traceId, associationId: req.user!.associationId, ticketId },
      'GET /api/dsar/[ticketId] - Request started',
    );

    const ticket = await findUniqueDsarTicket(ticketId, req.user!.associationId);
    if (!ticket) throw new NotFoundError('DSAR ticket not found');

    const isOwner = ticket.userId === userId;
    if (!isOwner) {
      await withRole(req, UserRole.DPO);
    }

    logger.info({ traceId }, 'GET /api/dsar/[ticketId] - Success');
    return success(res, { data: ticket });
  }),
];

/** DELETE /api/dsar/:ticketId - Delete a DSAR ticket (DPO role required). */
export const deleteTicket: RequestHandler[] = [
  validate({ params: DsarTicketParamsSchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';
    const actorId = req.user?.id as string;
    const ticketId = req.params.ticketId as string;

    logger.info(
      { traceId, associationId: req.user!.associationId, ticketId },
      'DELETE /api/dsar/[ticketId] - Request started',
    );

    await withRole(req, UserRole.DPO);

    const ticket = await findUniqueDsarTicket(ticketId, req.user!.associationId);
    if (!ticket) throw new NotFoundError('DSAR ticket not found');

    await deleteDsarTicket({ associationId: req.user!.associationId, ticketId, actorId });

    logger.info({ traceId }, 'DELETE /api/dsar/[ticketId] - Success');
    return success(res, { data: null, message: 'DSAR ticket deleted successfully' });
  }),
];

/** POST /api/dsar/:ticketId/respond - Respond to a DSAR ticket (DPO role required). */
export const respondToTicket: RequestHandler[] = [
  validate({ params: DsarTicketParamsSchema, body: RespondDsarSchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';
    const ticketId = req.params.ticketId as string;

    logger.info(
      { traceId, associationId: req.user!.associationId, ticketId },
      'POST /api/dsar/[ticketId]/respond - Request started',
    );

    const actorId = req.user?.id as string;
    await withRole(req, UserRole.DPO);

    const ticket = await respondToDsarTicket({
      associationId: req.user!.associationId,
      ticketId,
      actorId,
      data: req.body,
    });

    logger.info({ traceId }, 'POST /api/dsar/[ticketId]/respond - Success');
    return success(res, { data: ticket });
  }),
];

/** PATCH /api/dsar/:ticketId/assign - Assign a DSAR ticket to an admin user (DPO role required). */
export const assignTicket: RequestHandler[] = [
  validate({ params: DsarTicketParamsSchema, body: AssignDsarSchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';
    const ticketId = req.params.ticketId as string;

    logger.info(
      { traceId, associationId: req.user!.associationId, ticketId },
      'PATCH /api/dsar/[ticketId]/assign - Request started',
    );

    const actorId = req.user?.id as string;
    await withRole(req, UserRole.DPO);

    const user = await findUniqueUser({ where: { id: req.body.assignedToId } });
    if (!user) throw new NotFoundError('User not found');
    if (!hasHighRoleAccess(user.role as UserRole[]))
      throw new BadRequestError('User does not have the required role');

    const ticket = await assignDsarTicket({
      associationId: req.user!.associationId,
      ticketId,
      actorId,
      assignedToId: req.body.assignedToId,
    });

    logger.info({ traceId }, 'PATCH /api/dsar/[ticketId]/assign - Success');
    return success(res, { data: ticket });
  }),
];

/** POST /api/dsar/:ticketId/reject - Reject a DSAR ticket with a reason (DPO role required). */
export const rejectTicket: RequestHandler[] = [
  validate({ params: DsarTicketParamsSchema, body: RejectDsarSchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';
    const ticketId = req.params.ticketId as string;

    logger.info(
      { traceId, associationId: req.user!.associationId, ticketId },
      'POST /api/dsar/[ticketId]/reject - Request started',
    );

    const actorId = req.user?.id as string;
    await withRole(req, UserRole.DPO);

    const ticket = await respondToDsarTicket({
      associationId: req.user!.associationId,
      ticketId,
      actorId,
      data: { status: DsarStatus.REJECTED, rejectedReason: req.body.reason },
    });

    logger.info({ traceId }, 'POST /api/dsar/[ticketId]/reject - Success');
    return success(res, { data: ticket });
  }),
];
