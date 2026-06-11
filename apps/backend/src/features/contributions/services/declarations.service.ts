import { BadRequestError, NotFoundError } from '@errors';
import { prisma } from '@lib';
import type { Prisma } from '@prisma/client';
import { DeclarationStatus } from '@prisma/client';
import { buildPagination, buildPaginationParams } from '@utils';
import { addMonths, differenceInCalendarMonths, endOfMonth, startOfMonth } from 'date-fns';

type DbClient = Prisma.TransactionClient | typeof prisma;

type Props = {
  where: Prisma.DeclarationsWhereInput;
  include?: Prisma.DeclarationsInclude;
  page?: number;
};

export async function findDeclarations({
  where,
  include,
  page = 1,
  db = prisma,
}: Props & { db?: DbClient }) {
  const { skip, take } = buildPaginationParams(page);
  const declaration = await db.declarations.findMany({ where, include, take, skip });
  const total = await db.declarations.count({ where });
  const pagination = buildPagination(total, page);
  return { declaration, pagination };
}

type FindUniqueDeclarationsProps = {
  where: Prisma.DeclarationsWhereUniqueInput;
  include?: Prisma.DeclarationsInclude;
};

export async function findUniqueDeclaration(
  { where, include }: FindUniqueDeclarationsProps,
  db: DbClient = prisma,
) {
  return await db.declarations.findUnique({ where, include });
}

export async function submitDeclaration(
  memberId: string,
  associationId: string,
  amount: number,
  db: DbClient = prisma,
) {
  const lastDeclaration = await db.declarations.findFirst({
    where: { memberId, status: DeclarationStatus.APPROVED },
    orderBy: { lastDeclarationDate: 'desc' },
    take: 1,
  });

  const today = new Date();

  let startDate: Date;

  if (lastDeclaration) {
    const lastEndDate = new Date(lastDeclaration.declerationEndDate);
    const monthSinceLastDeclaration = differenceInCalendarMonths(today, lastEndDate);
    if (monthSinceLastDeclaration < 1) {
      throw new BadRequestError('You must wait at least 1 months between declarations.');
    }
    startDate = startOfMonth(addMonths(lastEndDate, 1));
  } else {
    startDate = startOfMonth(today);
  }

  const endDate = endOfMonth(today);

  return db.declarations.create({
    data: {
      memberId,
      associationId,
      declerationStartDate: startDate,
      declerationEndDate: endDate,
      amount,
      status: DeclarationStatus.PENDING,
    },
  });
}

export async function approveDeclaration(
  id: string,
  associationId: string,
  reviewBy: string,
  remark: string,
  db: DbClient = prisma,
) {
  const existing = await db.declarations.findUnique({
    where: { id, associationId },
  });

  if (!existing) throw new NotFoundError('Declaration not found');

  if (existing.status === DeclarationStatus.APPROVED) {
    return { declaration: existing, wasAlreadyApproved: true };
  }

  const updated = await db.declarations.update({
    where: { id, associationId },
    data: {
      status: DeclarationStatus.APPROVED,
      reviewBy,
      reviewAt: new Date(),
      remark,
      lastDeclarationDate: endOfMonth(new Date()),
    },
  });

  return { declaration: updated, wasAlreadyApproved: false };
}

export async function rejectDeclaration(
  id: string,
  associationId: string,
  reviewBy: string,
  remark: string,
  db: DbClient = prisma,
) {
  const existing = await db.declarations.findUnique({
    where: { id, associationId },
  });

  if (!existing) throw new NotFoundError('Declaration not found');

  if (existing.status === DeclarationStatus.APPROVED) {
    throw new BadRequestError('Cannot change approved declaration.');
  }

  if (existing.status === DeclarationStatus.REJECTED) {
    return { declaration: existing, wasAlreadyRejected: true };
  }

  const updated = await db.declarations.update({
    where: { id, associationId },
    data: {
      status: DeclarationStatus.REJECTED,
      reviewBy,
      reviewAt: new Date(),
      remark,
    },
  });

  return { declaration: updated, wasAlreadyRejected: false };
}
