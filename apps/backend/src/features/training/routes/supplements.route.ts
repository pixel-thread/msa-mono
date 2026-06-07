// ---- External libs ----
import { BadRequestError, NotFoundError } from '@errors';
// ---- Services ----
import {
  createSupplement,
  deleteSupplement,
  findManySupplements,
  updateSupplement,
} from '@feature/training/services';
// ---- Validators ----
import {
  CreateSupplementSchema,
  UpdateSupplementSchema,
} from '@feature/training/validators/training';
import { prisma } from '@lib/prisma';
import { deleteFromBucket,uploadToBucket } from '@lib/supabase/storage';
// ---- Shared utilities ----
import { validate } from '@lib/validate';
// ---- Prisma ----
import { UserRole } from '@prisma/client';
import { getAssociation } from '@services/association/get-association';
import { env } from '@src/env';
import { fileUpload } from '@src/middleware/file-upload';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { RequestHandler } from 'express';
import type { Request, Response } from 'express';
// ---- External libs ----
import { z } from 'zod';

// ---- Schemas ----

/** Schema for module ID path parameter. */
const ModuleParamsSchema = z.object({
  moduleId: z.uuid('Invalid module ID'),
});

/** Schema for module + supplement ID path parameters. */
const SupplementParamsSchema = z.object({
  moduleId: z.uuid('Invalid module ID'),
  supplementId: z.uuid('Invalid supplement ID'),
});

// ---------------------------------------------------------------------------
// GET /training/modules/:moduleId/supplements
// Description: List supplements for a module
// Security:    MEMBER role required
// ---------------------------------------------------------------------------

export const getSupplements: RequestHandler[] = [
  validate({ params: ModuleParamsSchema }),

  asyncHandler(async (req: Request, res: Response) => {
    const traceId = (req.traceId as string) || '';

    const association = await getAssociation(req);

    logger.info(
      { traceId, associationId: association.id },
      'GET /training/modules/{moduleId}/supplements - Request started',
    );

    // Authorize: minimum MEMBER role
    await withRole(req, UserRole.MEMBER);

    logger.info({ traceId }, 'GET /training/modules/{moduleId}/supplements - User authorized');

    // Fetch supplements
    const supplements = await findManySupplements({
      associationId: association.id,
      moduleId: req.params.moduleId as string,
    });

    logger.info({ traceId }, 'GET /training/modules/{moduleId}/supplements - Success');
    return success(res, { data: supplements });
  }),
];

// ---------------------------------------------------------------------------
// POST /training/modules/:moduleId/supplements
// Description: Upload a supplement file
// Security:    DPO role required
// ---------------------------------------------------------------------------

export const postSupplement: RequestHandler[] = [
  fileUpload.single('file'),
  validate({ params: ModuleParamsSchema }),

  asyncHandler(async (req: Request, res: Response) => {
    const traceId = (req.traceId as string) || '';

    // Resolve association
    const association = await getAssociation(req);

    logger.info(
      { traceId, associationId: association.id, moduleId: req.params.moduleId },
      'POST /training/modules/{moduleId}/supplements - Request started',
    );

    // Authorize: DPO role required
    const user = await withRole(req, UserRole.DPO);

    logger.info(
      { traceId, userId: user.id },
      'POST /training/modules/{moduleId}/supplements - User authorized',
    );

    // Parse request: file + metadata JSON
    const { moduleId } = req.params;
    const file = req.file;
    const metadataRaw = req.body.metadata as string | undefined;

    if (!file || !metadataRaw) {
      throw new BadRequestError('File and metadata are required');
    }

    // Validate metadata against schema
    let metadata: z.infer<typeof CreateSupplementSchema>;

    try {
      metadata = CreateSupplementSchema.parse(JSON.parse(metadataRaw));
    } catch (error) {
      if (error instanceof SyntaxError) throw new BadRequestError('Invalid metadata JSON');
      throw error;
    }

    if (!file.size || file.size === 0) {
      throw new BadRequestError('File is empty');
    }

    // Upload file to Supabase storage
    const uploadResult = await uploadToBucket(
      file,
      `supplements/${association.slug}/${moduleId}`,
      traceId,
    );

    // Create a File record in the database
    const fileRecord = await prisma.file.create({
      data: {
        associationId: association.id,
        originalName: file.originalname,
        storedName: uploadResult.key,
        mimeType: uploadResult.mimeType,
        extension: file.originalname.split('.').pop() || null,
        sizeBytes: uploadResult.sizeBytes,
        bucket: env.STORAGE_BUCKET,
        storageKey: uploadResult.key,
        url: uploadResult.url,
        uploadedById: user.id,
      },
    });

    // Create the supplement record
    const supplement = await createSupplement({
      associationId: association.id,
      moduleId: moduleId as string,
      actorId: user.id,
      data: metadata,
      downloadUrl: uploadResult.url,
      fileId: fileRecord.id,
    });

    logger.info(
      { traceId, supplementId: supplement.id },
      'POST /training/modules/{moduleId}/supplements - Success',
    );
    return success(res, { data: supplement }, 201);
  }),
];

// ---------------------------------------------------------------------------
// GET /training/modules/:moduleId/supplements/:supplementId
// Description: Retrieve a single supplement
// Security:    MEMBER role required
// ---------------------------------------------------------------------------

export const getSupplement: RequestHandler[] = [
  validate({ params: SupplementParamsSchema }),

  asyncHandler(async (req: Request, res: Response) => {
    const traceId = (req.traceId as string) || '';

    const association = await getAssociation(req);

    logger.info(
      { traceId, associationId: association.id },
      'GET /training/modules/{moduleId}/supplements/{supplementId} - Request started',
    );

    // Authorize: minimum MEMBER role
    await withRole(req, UserRole.MEMBER);

    logger.info(
      { traceId },
      'GET /training/modules/{moduleId}/supplements/{supplementId} - User authorized',
    );

    // Find supplement by filtering the module's supplement list
    const { moduleId, supplementId } = req.params;
    const supplements = await findManySupplements({
      associationId: association.id,
      moduleId: moduleId as string,
    });
    const supplement = supplements.find((s) => s.id === supplementId);

    if (!supplement) throw new NotFoundError('Training supplement not found');

    logger.info(
      { traceId, supplementId },
      'GET /training/modules/{moduleId}/supplements/{supplementId} - Success',
    );
    return success(res, { data: supplement });
  }),
];

// ---------------------------------------------------------------------------
// PATCH /training/modules/:moduleId/supplements/:supplementId
// Description: Update a supplement (optionally replace file)
// Security:    DPO role required
// ---------------------------------------------------------------------------

export const updateSupplementHandler: RequestHandler[] = [
  fileUpload.single('file'),
  validate({ params: SupplementParamsSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const traceId = (req.traceId as string) || '';

    const association = await getAssociation(req);

    logger.info(
      { traceId, associationId: association.id },
      'PATCH /training/modules/{moduleId}/supplements/{supplementId} - Request started',
    );

    // Authorize: DPO role required
    const user = await withRole(req, UserRole.DPO);

    logger.info(
      { traceId, userId: user.id },
      'PATCH /training/modules/{moduleId}/supplements/{supplementId} - User authorized',
    );

    // Parse request: optional file + required metadata JSON
    const { moduleId, supplementId } = req.params;
    const file = req.file;
    const metadataRaw = req.body.metadata as string | undefined;

    if (!metadataRaw) {
      throw new BadRequestError('Metadata is required');
    }

    // Validate metadata
    let metadata: z.infer<typeof UpdateSupplementSchema>;
    try {
      metadata = UpdateSupplementSchema.parse(JSON.parse(metadataRaw));
    } catch (error) {
      if (error instanceof SyntaxError) throw new BadRequestError('Invalid metadata JSON');
      throw error;
    }

    // Upload new file if provided
    let downloadUrl: string | undefined;
    let fileId: string | undefined;

    if (file) {
      if (!file.size || file.size === 0) {
        throw new BadRequestError('File is empty');
      }

      const uploadResult = await uploadToBucket(
        file,
        `supplements/${association.slug}/${moduleId}`,
        traceId,
      );

      const fileRecord = await prisma.file.create({
        data: {
          associationId: association.id,
          originalName: file.originalname,
          storedName: uploadResult.key,
          mimeType: uploadResult.mimeType,
          extension: file.originalname.split('.').pop() || null,
          sizeBytes: uploadResult.sizeBytes,
          bucket: env.STORAGE_BUCKET,
          storageKey: uploadResult.key,
          url: uploadResult.url,
          uploadedById: user.id,
        },
      });

      downloadUrl = uploadResult.url;
      fileId = fileRecord.id;
    }

    // Apply the update (old file cleanup happens in service)
    const { supplement, oldStorageKey } = await updateSupplement({
      associationId: association.id,
      moduleId: moduleId as string,
      supplementId: supplementId as string,
      actorId: user.id,
      data: metadata,
      downloadUrl,
      fileId,
    });

    // Clean up old file from storage
    if (oldStorageKey) {
      try {
        await deleteFromBucket(oldStorageKey);
      } catch {
        /* best-effort cleanup */
      }
    }

    logger.info(
      { traceId, supplementId },
      'PATCH /training/modules/{moduleId}/supplements/{supplementId} - Success',
    );
    return success(res, { data: supplement });
  }),
];

// ---------------------------------------------------------------------------
// DELETE /training/modules/:moduleId/supplements/:supplementId
// Description: Delete a supplement and its file
// Security:    DPO role required
// ---------------------------------------------------------------------------

export const deleteSupplementHandler: RequestHandler[] = [
  validate({ params: SupplementParamsSchema }),

  asyncHandler(async (req: Request, res: Response) => {
    const traceId = (req.traceId as string) || '';

    // Resolve association
    const association = await getAssociation(req);

    logger.info(
      { traceId, associationId: association.id },
      'DELETE /training/modules/{moduleId}/supplements/{supplementId} - Request started',
    );

    // Authorize: DPO role required
    const user = await withRole(req, UserRole.DPO);

    logger.info(
      { traceId, userId: user.id },
      'DELETE /training/modules/{moduleId}/supplements/{supplementId} - User authorized',
    );

    // Delete the supplement (cascades to file record)
    const { moduleId, supplementId } = req.params;
    const result = await deleteSupplement({
      associationId: association.id,
      moduleId: moduleId as string,
      supplementId: supplementId as string,
      actorId: user.id,
    });

    // Clean up file from storage
    if (result.storageKey) {
      try {
        await deleteFromBucket(result.storageKey);
      } catch {
        /* best-effort cleanup */
      }
    }

    logger.info(
      { traceId, supplementId },
      'DELETE /training/modules/{moduleId}/supplements/{supplementId} - Success',
    );
    return success(res, { data: { success: true, message: 'Training supplement deleted' } });
  }),
];
