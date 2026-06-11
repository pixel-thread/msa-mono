import type { DocumentReferenceType, Prisma } from '@prisma/client';

/** Input for creating a single document reference. */
export interface CreateDocumentReferenceInput {
  type: DocumentReferenceType;
  reference?: string | null;
  fileId?: string | null;
  remarks?: string | null;
  paidAt?: Date | string | null;
}

/**
 * Batch-create document references linked to a ledger entry.
 *
 * Uses `createMany` for efficient bulk inserts — one round-trip
 * regardless of reference count.
 *
 * @param tx - Prisma transaction client
 * @param ledgerEntryId - The ledger entry to attach references to
 * @param references - Array of reference inputs
 */
export async function createLedgerDocumentReferences(
  tx: Prisma.TransactionClient,
  ledgerEntryId: string,
  references: CreateDocumentReferenceInput[],
) {
  if (references.length === 0) return [];

  return tx.documentReference.createMany({
    data: references.map((ref) => ({
      ledgerEntryId,
      type: ref.type,
      reference: ref.reference ?? null,
      fileId: ref.fileId ?? null,
      remarks: ref.remarks ?? null,
      paidAt: ref.paidAt ?? null,
    })),
  });
}

/**
 * Batch-create document references linked to a payment transaction.
 *
 * Uses `createMany` for efficient bulk inserts — one round-trip
 * regardless of reference count.
 *
 * @param tx - Prisma transaction client
 * @param paymentTransactionId - The payment transaction to attach references to
 * @param references - Array of reference inputs
 */
export async function createPaymentDocumentReferences(
  tx: Prisma.TransactionClient,
  paymentTransactionId: string,
  references: CreateDocumentReferenceInput[],
) {
  if (references.length === 0) return [];

  return tx.documentReference.createMany({
    data: references.map((ref) => ({
      paymentTransactionId,
      type: ref.type,
      reference: ref.reference ?? null,
      fileId: ref.fileId ?? null,
      remarks: ref.remarks ?? null,
      paidAt: ref.paidAt ?? null,
    })),
  });
}
