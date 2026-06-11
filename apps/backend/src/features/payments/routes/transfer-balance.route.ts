import type { TransferBalanceInput } from '@feature/payments/validators';
import { TransferBalanceSchema } from '@feature/payments/validators';
import { prisma } from '@lib/prisma';
import { validate } from '@lib/validate';
import { AuditAction, UserRole } from '@prisma/client';
import { logAction } from '@services/audit-logs';
import { createLedgerEntryReferences } from '@services/ledger-entry-reference';
import { transferBalance } from '@services/transfer-balance';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { RequestHandler } from 'express';
import type { NextFunction, Request, Response } from 'express';

export const postTransferBalance: RequestHandler[] = [
  // rbac(UserRole.PRESIDENT),
  validate({ body: TransferBalanceSchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    logger.info({ traceId }, 'POST /api/v1/payments/transfer - Request started');

    const user = await withRole(req, UserRole.FINANCE);

    logger.info({ traceId, userId: user.id }, 'POST /api/v1/payments/transfer - User authorized');

    const {
      fromAccountId: sourceAccountId,
      toAccountId: destinationAccountId,
      amount,
      remark: description,
      references,
    } = req.body as TransferBalanceInput;

    const entry = await prisma.$transaction(async (tx) => {
      const ledgerEntry = await transferBalance(tx, {
        associationId: req.user!.associationId,
        sourceAccountId,
        destinationAccountId,
        amount,
        description,
        createdById: user.id,
      });

      if (references?.length) {
        await createLedgerEntryReferences(
          tx,
          ledgerEntry!.id,
          references.map((ref) => ({
            type: 'TEXT' as const,
            reference: ref.reference,
            remarks: ref.remarks ?? null,
          })),
        );
      }

      await logAction(
        {
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
            referenceCount: references?.length ?? 0,
          },
        },
        tx,
      );

      return ledgerEntry!;
    });

    const entryWithRefs = await prisma.ledgerEntry.findUnique({
      where: { id: entry.id },
      include: { lines: true, references: true },
    });

    logger.info({ traceId, entryId: entry.id }, 'POST /api/v1/payments/transfer - Success');

    return success(
      res,
      { data: entryWithRefs, message: 'Balance transfer recorded successfully. Pending approval.' },
      201,
    );
  }),
];
