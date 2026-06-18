import { ForbiddenError, UnauthorizedError } from '@src/shared/errors';
import { prisma } from '@src/shared/lib';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import type { RequestHandler } from 'express';

import { getDashboardOverview } from '../services/dashboard.service';

export const overviewRouteHandler: RequestHandler[] = [
  asyncHandler(async (req, res) => {
    // ----- Verify authenticated user
    const userId = req.user?.id;

    if (!userId) throw new UnauthorizedError('Unauthorized');

    // ----- Resolve user's association
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { association: true },
    });

    if (!user || !user.associationId) throw new ForbiddenError('User association not found 2');

    // ----- Fetch dashboard data
    const association = {
      id: user.association.id,
      slug: user.association.slug,
      name: user.association.name,
    };

    const data = await getDashboardOverview(association.id);

    return success(res, { data });
  }),
];

export const myOverviewRouteHandler: RequestHandler[] = [
  asyncHandler(async (req, res) => {
    // ----- Verify authenticated user
    const userId = req.user?.id;

    if (!userId) throw new UnauthorizedError('Unauthorized');

    // ----- Resolve user's association
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { association: true },
    });

    if (!user || !user.associationId) throw new ForbiddenError('User association not found 2');

    // ----- Fetch dashboard data
    const association = {
      id: user.association.id,
      slug: user.association.slug,
      name: user.association.name,
    };

    const data = await getDashboardOverview(association.id, userId);

    return success(res, { data });
  }),
];
