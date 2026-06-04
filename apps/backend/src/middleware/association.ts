import { Request, Response, NextFunction, RequestHandler } from 'express';
import { prisma } from '@src/shared/lib/prisma';
import { ForbiddenError, UnauthorizedError } from '@src/shared/errors';
import { asyncHandler } from '@src/shared/utils/async-handler';

export const association: RequestHandler = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const userId = req.userId;

    if (!userId) {
      throw new UnauthorizedError('Unauthorized');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        association: {
          select: {
            id: true,
            slug: true,
            name: true,
          },
        },
      },
    });

    if (!user?.association) {
      throw new ForbiddenError('User association not found');
    }

    req.association = user.association;

    next();
  },
);
