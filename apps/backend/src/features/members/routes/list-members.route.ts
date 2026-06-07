// ---------------------------------------------------------------------------
// External libs
// ---------------------------------------------------------------------------
import { ForbiddenError, UnauthorizedError } from '@errors';
// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------
import { getMembers } from '@feature/members/services/getMembers';
import { prisma } from '@lib/prisma';
// ---------------------------------------------------------------------------
// Shared utilities
// ---------------------------------------------------------------------------
import { validate } from '@lib/validate';
// ---------------------------------------------------------------------------
// Prisma
// ---------------------------------------------------------------------------
import { UserRole } from '@prisma/client';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import { hasHighRoleAccess } from '@utils/has-high-role';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { NextFunction, Request, Response } from 'express';
import { type RequestHandler } from 'express';
import type z from 'zod';

import { MemberQuerySchema } from '../validators';

// ---------------------------------------------------------------------------
// Schema — validate query parameters when listing members
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// GET /api/members  —  Paginated / filtered / searched member list
// Security: requires SECRETARY role
// Business intent: allow authorised officers to browse all members in their
//   association, optionally narrowed by status or a free-text search.
// ---------------------------------------------------------------------------
export const listMembers: RequestHandler[] = [
  validate({ query: MemberQuerySchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // ── Auth ────────────────────────────────────────────────────────────────
    const userId: string = (req.user?.id as string) || '';
    if (!userId) throw new UnauthorizedError('Unauthorized');

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { association: true },
    });
    if (!user || !user.associationId) throw new ForbiddenError('User association not found');

    const association = {
      id: user.association.id,
      slug: user.association.slug,
      name: user.association.name,
    };

    // ── Auth log ────────────────────────────────────────────────────────────
    logger.info({ traceId, associationId: association.id }, 'GET /api/members - Request started');

    await withRole(req, UserRole.SECRETARY);

    logger.info({ traceId, userId: user.id }, 'GET /api/members - User authorized');

    // ── Business logic — build filters & fetch ──────────────────────────────
    const query = req.query as unknown as z.infer<typeof MemberQuerySchema>;
    const page = query?.page;
    const status = query?.status;
    const search = query?.search;

    const baseWhere: Record<string, unknown> = {
      associationId: association.id,
    };
    if (status) baseWhere.status = status;

    let members;
    if (search) {
      members = await getMembers({ where: baseWhere, search, page });
    } else if (!hasHighRoleAccess(user.role)) {
      // Non-high-role users should only see ACTIVE members for privacy
      members = await getMembers({ where: { ...baseWhere, status: 'ACTIVE' }, page });
    } else {
      members = await getMembers({ where: baseWhere, page });
    }

    // ── Result log & response ───────────────────────────────────────────────
    logger.info({ traceId, count: members.data.length }, 'GET /api/members - Success');

    return success(res, { data: members.data, meta: members.pagination });
  }),
];
