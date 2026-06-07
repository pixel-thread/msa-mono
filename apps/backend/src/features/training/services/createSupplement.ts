// ---- External libs ----
import { NotFoundError } from '@errors';
// ---- Shared utilities ----
import { prisma } from '@lib/prisma';
import type { Prisma } from '@prisma/client';
import { AuditAction } from '@prisma/client';

// ---- Validators ----
import type { CreateSupplementInput } from '../validators/training';

// ---- Interfaces ----

/** Parameters for creating a training supplement. */
interface CreateSupplementProps {
  associationId: string;
  moduleId: string;
  actorId: string;
  data: CreateSupplementInput;
  downloadUrl: string;
  fileId?: string;
}

// ---- Service ----

/** Create a training supplement with audit logging. */
export async function createSupplement({
  associationId,
  moduleId,
  actorId,
  data,
  downloadUrl,
  fileId,
}: CreateSupplementProps) {
  return await prisma.$transaction(async (tx) => {
    // Verify the module exists in this association
    const trainingModule = await tx.trainingModule.findFirst({
      where: { id: moduleId, associationId },
    });

    if (!trainingModule) {
      throw new NotFoundError('Training module not found');
    }

    // Create the supplement record
    const supplement = await tx.trainingSupplement.create({
      data: {
        moduleId,
        ...data,
        downloadUrl,
        ...(fileId && { fileId }),
      },
    });

    // Audit the supplement creation
    await tx.auditLog.create({
      data: {
        associationId,
        actorId,
        action: AuditAction.TRAINING_MODULE_UPDATE,
        resourceType: 'TrainingSupplement',
        resourceId: supplement.id,
        newValues: data as Prisma.InputJsonValue,
      },
    });

    return supplement;
  });
}
