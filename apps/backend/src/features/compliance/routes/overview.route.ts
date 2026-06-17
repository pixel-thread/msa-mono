// ---------------------------------------------------------------------------
// External libs
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------
import { createComplaint, findManyComplaints } from '@feature/compliance/services';
// ---------------------------------------------------------------------------
// Validators / Types
// ---------------------------------------------------------------------------
import { ComplaintQuerySchema, CreateComplaintSchema } from '@feature/compliance/validators';
// ---------------------------------------------------------------------------
// Shared utilities
// ---------------------------------------------------------------------------
import { validate } from '@lib/validate';
// ---------------------------------------------------------------------------
// Prisma
// ---------------------------------------------------------------------------
import { UserRole } from '@prisma/client';
import { logger } from '@src/shared/logger';
import { buildPagination } from '@src/shared/utils/helper/build-pagination';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { RequestHandler } from 'express';
import type { NextFunction, Request, Response } from 'express';

// ---------------------------------------------------------------------------
// GET /compliance  —  List all complaints with optional filters
// Security: requires DPO role
// Business intent: allow data-protection officers to review every complaint
//   filed across the association, with pagination and date/status/priority
//   filtering.
// ---------------------------------------------------------------------------
export const listComplaints: RequestHandler[] = [
  validate({ query: ComplaintQuerySchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // ── Auth ────────────────────────────────────────────────────────────────
    // ── Auth log ────────────────────────────────────────────────────────────
    logger.info(
      { traceId, associationId: req.user!.associationId },
      'GET /compliance - Request started',
    );

    const user = await withRole(req, UserRole.DPO);

    logger.info(
      { traceId, userId: user.id, roles: user.role },
      'GET /compliance - User authorized',
    );

    // ── Business logic — build filters & fetch ──────────────────────────────
    const query = req.query as unknown as Record<string, unknown>;
    const where: Record<string, unknown> = { associationId: req.user!.associationId };

    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;
    if (query.fromDate) {
      where.createdAt = {
        ...((where.createdAt as object) || {}),
        gte: new Date(query.fromDate as string),
      };
    }
    if (query.toDate) {
      where.createdAt = {
        ...((where.createdAt as object) || {}),
        lte: new Date(query.toDate as string),
      };
    }

    const page = (query.page as number) ?? 1;
    const { complaints, total } = await findManyComplaints({
      where: where as Parameters<typeof findManyComplaints>[0]['where'],
      page,
    });

    // ── Result log & response ───────────────────────────────────────────────
    logger.info({ traceId, count: complaints.length }, 'GET /compliance - Success');
    return success(res, { data: complaints, meta: buildPagination(total, page) });
  }),
];

// ---------------------------------------------------------------------------
// POST /compliance  —  Create a new compliance complaint
// Security: requires DPO role
// Business intent: allow DPOs to formally log a compliance concern on
//   behalf of the association (category, subject, description, priority).
// ---------------------------------------------------------------------------
export const createComplaintHandler: RequestHandler[] = [
  validate({ body: CreateComplaintSchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // ── Auth ────────────────────────────────────────────────────────────────
    // ── Auth log ────────────────────────────────────────────────────────────
    logger.info(
      { traceId, associationId: req.user!.associationId },
      'POST /compliance - Request started',
    );

    const user = await withRole(req, UserRole.MEMBER);

    logger.info(
      { traceId, userId: user.id, roles: user.role },
      'POST /compliance - User authorized',
    );

    // ── Business logic ──────────────────────────────────────────────────────
    const userId = req.user?.id as string;
    const complaint = await createComplaint({
      associationId: req.user!.associationId,
      userId,
      data: req.body,
    });

    // ── Result log & response ───────────────────────────────────────────────
    logger.info({ traceId, complaintId: complaint.id }, 'POST /compliance - Success');
    return success(res, { data: complaint, message: 'Complaint created successfully' }, 201);
  }),
];
