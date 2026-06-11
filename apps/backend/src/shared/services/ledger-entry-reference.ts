import type { LedgerEntryReferenceType, Prisma } from '@prisma/client';

export interface CreateReferenceInput {
  type: LedgerEntryReferenceType;
  reference?: string | null;
  fileId?: string | null;
  remarks?: string | null;
}

export async function createLedgerEntryReferences(
  tx: Prisma.TransactionClient,
  ledgerEntryId: string,
  references: CreateReferenceInput[],
) {
  if (references.length === 0) return [];

  return tx.ledgerEntryReference.createMany({
    data: references.map((ref) => ({
      ledgerEntryId,
      type: ref.type,
      reference: ref.reference ?? null,
      fileId: ref.fileId ?? null,
      remarks: ref.remarks ?? null,
    })),
  });
}
