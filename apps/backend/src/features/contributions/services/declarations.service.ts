import { Prisma } from '@prisma/client';
import { PAGE_SIZE } from '@src/shared/constants';
import { prisma } from '@src/shared/lib';
import { buildPagination } from '@src/shared/utils';

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
