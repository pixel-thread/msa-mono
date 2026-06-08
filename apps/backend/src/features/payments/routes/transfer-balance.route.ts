import { TransferBalanceSchema } from '@feature/payments/validators';
import { prisma } from '@lib/prisma';
import { validate } from '@lib/validate';
import { AuditAction, UserRole } from '@prisma/client';
import { logAction } from '@services/audit-logs';
import { transferBalance } from '@services/transfer-balance';
import { rbac } from '@src/middleware';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { RequestHandler } from 'express';
import type { NextFunction, Request, Response } from 'express';

export const postTransferBalance: RequestHandler[] = [
  rbac(UserRole.PRESIDENT),
  validate({ body: TransferBalanceSchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    logger.info({ traceId }, 'POST /api/v1/payments/transfer - Request started');

    const user = await withRole(req, UserRole.FINANCE);

    logger.info({ traceId, userId: user.id }, 'POST /api/v1/payments/transfer - User authorized');

    const { sourceAccountId, destinationAccountId, amount, description } = req.body;

    const entry = await prisma.$transaction(async (tx) => {
      const ledgerEntry = await transferBalance(tx, {
        associationId: req.user!.associationId,
        sourceAccountId,
        destinationAccountId,
        amount,
        description,
        createdById: user.id,
      });

      await logAction({
        associationId: req.user!.associationId,
        actorId: user.id,
        action: AuditAction.LEDGER_TRANSFER,
        resourceType: 'LedgerEntry',
        resourceId: ledgerEntry!.id,
        newValues: {
          sourceAccountId,
          destinationAccountId,
          amount,
          description,
        },
      });

      return ledgerEntry!;
    });

    logger.info({ traceId, entryId: entry.id }, 'POST /api/v1/payments/transfer - Success');

    return success(
      res,
      { data: entry, message: 'Balance transfer recorded successfully. Pending approval.' },
      201,
    );
  }),
];
