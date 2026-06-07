import { prisma } from '@lib/prisma';
import type { Prisma } from '@prisma/client';

// ---- Types ----

/** Props for deleting refresh tokens. */
type Props = {
  /** The filter to select which tokens to delete. */
  where: Prisma.RefreshTokenWhereInput;
};

// ---- Service ----

/** Remove all refresh tokens matching the given criteria — used when a password change or reset invalidates all existing sessions. */
export async function deleteRefreshTokens(props: Props) {
  return await prisma.refreshToken.deleteMany(props);
}
