// ---- External libs ----
import { BadRequestError, NotFoundError } from '@errors';
// ---- Shared utilities ----
import { prisma } from '@lib/prisma';
import { AuditAction, Prisma } from '@prisma/client';

// ---- Validators ----
import { CreateTrainingCertificateInput } from '../validators/training';

// ---- Interfaces ----

/** Parameters for creating a training certificate. */
interface CreateCertificateProps {
  associationId: string;
  moduleId: string;
  actorId: string;
  data: CreateTrainingCertificateInput;
  certificateUrl: string;
  fileId?: string;
}

// ---- Service ----

/** Create a training certificate for a user with audit logging. */
export async function createCertificate({
  associationId,
  moduleId,
  actorId,
  data,
  certificateUrl,
  fileId,
}: CreateCertificateProps) {
  return await prisma.$transaction(async (tx) => {
    // Verify the module exists
    const trainingModule = await tx.trainingModule.findFirst({
      where: { id: moduleId, associationId },
    });

    if (!trainingModule) {
      throw new NotFoundError('Training module not found');
    }
    // check if user exists
    const user = await tx.user.findFirst({
      where: { id: data.userId, associationId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }
    //check if user is already has a certificate under this module
    const existingCertificate = await tx.trainingCertificate.findFirst({
      where: { moduleId, userId: data.userId },
    });

    if (existingCertificate) {
      throw new BadRequestError('User already has a certificate under this module');
    }

    // Create the certificate record
    const certificate = await tx.trainingCertificate.create({
      data: {
        moduleId,
        userId: data.userId,
        certificateUrl,
        ...(data.certificateNumber && {
          certificateNumber: data.certificateNumber,
        }),
        ...(data.issuedAt && { issuedAt: new Date(data.issuedAt) }),
        ...(data.thumbnailUrl && { thumbnailUrl: data.thumbnailUrl }),
        ...(fileId && { fileId }),
      },
    });

    // Audit the certificate creation
    await tx.auditLog.create({
      data: {
        associationId,
        actorId,
        action: AuditAction.TRAINING_MODULE_UPDATE,
        resourceType: 'TrainingCertificate',
        resourceId: certificate.id,
        newValues: { userId: data.userId, moduleId } as Prisma.InputJsonValue,
      },
    });

    return certificate;
  });
}
