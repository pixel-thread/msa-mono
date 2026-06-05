import { Prisma } from '@prisma/client';
import { prisma } from '@src/shared/lib';

type Props = {
  where: Prisma.DeclarationsWhereInput;
  include?: Prisma.DeclarationsInclude;
};

export async function findDeclarations({ where, include }: Props) {
  return await prisma.declarations.findMany({ where, include });
}

type FindUniqueDeclarationsProps = {
  where: Prisma.DeclarationsWhereUniqueInput;
  include?: Prisma.DeclarationsInclude;
};

export async function findUniqueDeclarations({ where, include }: FindUniqueDeclarationsProps) {
  return await prisma.declarations.findUnique({ where, include });
}
