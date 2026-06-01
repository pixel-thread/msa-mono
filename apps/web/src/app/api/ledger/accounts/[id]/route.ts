import { withAssociation, withRole } from '@src/shared/api';
import { SuccessResponse } from '@src/shared/utils/responses';
import { UserRole } from '@prisma/client';
import { getAccountById } from '@src/features/ledger/services/ledger.service';
import { GetAccountParamsSchema } from '@src/features/ledger/validators';
import { logger } from '@src/shared/logger/server';

export const GET = withAssociation(
  { params: GetAccountParamsSchema },
  async (association, { params, traceId }, request) => {
    logger.info({ traceId, associationId: association.id, accountId: params!.id }, 'GET /api/ledger/accounts/[id] - Request started');

    await withRole(request, UserRole.FINANCE);

    const account = await getAccountById(association.id, params!.id);

    logger.info({ traceId, accountId: account.id }, 'GET /api/ledger/accounts/[id] - Success');

    return SuccessResponse({ data: account });
  },
);
