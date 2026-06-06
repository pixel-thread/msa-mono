import { DeclarationStatus, Prisma } from '@prisma/client';
import { differenceInCalendarMonths, addMonths, startOfMonth, endOfMonth } from 'date-fns';
import { PAGE_SIZE } from '@src/shared/constants';
import { prisma } from '@src/shared/lib';
import { buildPagination } from '@utils';
import { BadRequestError, NotFoundError } from '@src/shared/errors';

type Props = {
  where: Prisma.DeclarationsWhereInput;
  include?: Prisma.DeclarationsInclude;
  page?: number;
};

export async function findDeclarations({ where, include, page = 1 }: Props) {
  const skip = (page - 1) * 10;
  return await prisma.$transaction(async (tx) => {
    const declaration = await tx.declarations.findMany({ where, include, take: PAGE_SIZE, skip });
    const total = await tx.declarations.count({ where });
    const pagination = buildPagination(total, page);
    return { declaration, pagination };
  });
}

type FindUniqueDeclarationsProps = {
  where: Prisma.DeclarationsWhereUniqueInput;
  include?: Prisma.DeclarationsInclude;
};

export async function findUniqueDeclaration({ where, include }: FindUniqueDeclarationsProps) {
  return await prisma.declarations.findUnique({ where, include });
}

export async function submitDeclaration(memberId: string, associationId: string, amount: number) {
  const lastDeclaration = await prisma.declarations.findFirst({
    where: { memberId, status: 'APPROVED' },
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

  return prisma.declarations.create({
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
) {
  const existing = await prisma.declarations.findUnique({
    where: { id, associationId },
  });

  if (!existing) throw new NotFoundError('Declaration not found');

  if (existing.status === DeclarationStatus.APPROVED) {
    return { declaration: existing, wasAlreadyApproved: true };
  }

  const updated = await prisma.declarations.update({
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
) {
  const existing = await prisma.declarations.findUnique({
    where: { id, associationId },
  });

  if (!existing) throw new NotFoundError('Declaration not found');

  if (existing.status === DeclarationStatus.APPROVED) {
    throw new BadRequestError('Cannot change approved declaration.');
  }

  if (existing.status === DeclarationStatus.REJECTED) {
    return { declaration: existing, wasAlreadyRejected: true };
  }

  const updated = await prisma.declarations.update({
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
