import { prisma } from '@lib/prisma';
import type { Prisma } from '@prisma/client';

// ---- Types ----

/** Props for updating a verification code. */
type Props = {
  /** The unique identifier of the code to update. */
  where: Prisma.VerificationCodeWhereUniqueInput;
  /** The data to update. */
  data: Prisma.VerificationCodeUpdateInput;
};

// ---- Service ----

/** Update a verification code — used to increment attempt counters and mark codes as used after successful OTP validation. */
export async function updateVerificationCode(props: Props) {
  return await prisma.verificationCode.update(props);
}
