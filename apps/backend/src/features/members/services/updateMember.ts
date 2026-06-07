// ---------------------------------------------------------------------------
// External libs
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Shared utilities
// ---------------------------------------------------------------------------
import { prisma } from '@lib/prisma';
import { Prisma } from '@prisma/client';

// ---------------------------------------------------------------------------
// Types — Props
// ---------------------------------------------------------------------------

/** Arguments for the updateMember query. */
type Props = {
  where: Prisma.UserWhereUniqueInput;
  data: Prisma.UserUpdateInput;
};

// ---------------------------------------------------------------------------
// Service — Update a member's data in the database
// Business intent: generic upsert wrapper used across all member mutation
//   handlers so that write access goes through a single Prisma gateway.
// ---------------------------------------------------------------------------
export async function updateMember({ data, where }: Props) {
  return await prisma.user.update({ where, data });
}
