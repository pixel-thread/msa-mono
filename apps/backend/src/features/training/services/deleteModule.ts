// ---- External libs ----
// ---- Shared utilities ----
import { NotFoundError } from '@errors';
import { prisma } from '@lib/prisma';
import { AuditAction } from '@prisma/client';
import { logAction } from '@services/audit-logs';

// ---- Service ----

/** Delete a training module with audit logging. */
export async function deleteModule(params: {
  associationId: string;
  moduleId: string;
  actorId: string;
}) {
  const { associationId, moduleId, actorId } = params;

  // Verify the module exists before deletion
  const existing = await prisma.trainingModule.findUnique({
    where: { id: moduleId, associationId },
  });

  if (!existing) {
    throw new NotFoundError('Training module not found');
  }

  // Perform the deletion
  await prisma.trainingModule.delete({
    where: { id: moduleId },
  });

  // Audit the deletion
  await logAction({
    actorId,
    action: AuditAction.DELETE,
    resourceType: 'TrainingModule',
    resourceId: moduleId,
    associationId,
  });

  return true;
}
