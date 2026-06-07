// ---- External libs ----
import { BadRequestError } from '@errors';
// ---- Services ----
import {
  completeAssignment,
  findManyCompletions,
  recordCompletion,
} from '@feature/training/services';
import type { CompletionMetadataInput } from '@feature/training/validators/training';
// ---- Validators ----
import {
  CompletionMetadataSchema,
  RecordCompletionSchema,
  TrainingAssignmentParamsSchema,
  TrainingModuleParamsSchema,
} from '@feature/training/validators/training';
import { prisma } from '@lib/prisma';
import { uploadToBucket } from '@lib/supabase/storage';
// ---- Shared utilities ----
import { validate } from '@lib/validate';
// ---- Prisma ----
import { UserRole } from '@prisma/client';
import { env } from '@src/env';
import { fileUpload } from '@src/middleware/file-upload';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { RequestHandler } from 'express';
import type { NextFunction, Request, Response } from 'express';

// ---------------------------------------------------------------------------
// GET /training/modules/:moduleId/complete
// Description: List completions for a module
// Security:    MEMBER role required
// ---------------------------------------------------------------------------

export const getModuleCompletions: RequestHandler[] = [
  validate({ params: TrainingModuleParamsSchema }),

  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    try {
      logger.info(
        { traceId, associationId: req.user!.associationId },
        'GET /training/modules/{moduleId}/complete - Request started',
      );

      // Authorize: minimum MEMBER role
      await withRole(req, UserRole.MEMBER);

      logger.info({ traceId }, 'GET /training/modules/{moduleId}/complete - User authorized');

      // Fetch completions for this module
      const data = await findManyCompletions({
        associationId: req.user!.associationId,
        moduleId: req.params.moduleId as string,
      });

      logger.info({ traceId }, 'GET /training/modules/{moduleId}/complete - Success');
      return success(res, { data: data.completions, meta: data.pagination });
    } catch (e) {
      next(e);
    }
  }),
];

// ---------------------------------------------------------------------------
// POST /training/modules/:moduleId/complete
// Description: Record a completion for the current user
// Security:    SUPER_ADMIN role required (self-completion gate)
// ---------------------------------------------------------------------------

export const postModuleComplete: RequestHandler[] = [
  validate({ params: TrainingModuleParamsSchema, body: RecordCompletionSchema }),

  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    try {
      logger.info(
        { traceId, associationId: req.user!.associationId },
        'POST /training/modules/{moduleId}/complete - Request started',
      );

      // Authorize: SUPER_ADMIN role required
      const user = await withRole(req, UserRole.SUPER_ADMIN);

      logger.info(
        { traceId, userId: user.id },
        'POST /training/modules/{moduleId}/complete - User authorized',
      );

      // Record the completion
      const completion = await recordCompletion({
        associationId: req.user!.associationId,
        userId: user.id,
        moduleId: req.params.moduleId as string,
        data: req.body,
      });

      logger.info(
        { traceId, completionId: completion.id },
        'POST /training/modules/{moduleId}/complete - Success',
      );
      return success(res, { data: completion }, 201);
    } catch (e) {
      next(e);
    }
  }),
];

// ---------------------------------------------------------------------------
// POST /training/modules/:moduleId/assignments/:userId/complete
// Description: Mark an assignment as complete (admin action)
// Security:    SECRETARY role required
// ---------------------------------------------------------------------------

export const postAdminComplete: RequestHandler[] = [
  fileUpload.single('file'),
  validate({ params: TrainingAssignmentParamsSchema }),

  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    try {
      logger.info(
        { traceId, associationId: req.user!.associationId },
        'POST /training/modules/{moduleId}/assignments/{userId}/complete - Request started',
      );

      // Authorize: SECRETARY role required
      const actor = await withRole(req, UserRole.SECRETARY);

      logger.info(
        { traceId, userId: actor.id },
        'POST /training/modules/{moduleId}/assignments/{userId}/complete - User authorized',
      );

      const { moduleId, userId } = req.params;
      const contentType = req.headers['content-type'] || '';

      // Parse metadata based on content type (multipart vs JSON)
      let scorePercent: number | undefined;
      let certificateOption: 'none' | 'global' | 'custom' = 'none';
      let certificateNumber: string | undefined;
      let file: Express.Multer.File | undefined;

      if (contentType.includes('multipart/form-data')) {
        const metadataRaw = req.body.metadata as string | undefined;

        file = req.file;

        if (!metadataRaw) {
          throw new BadRequestError('Metadata is required');
        }

        let metadata: CompletionMetadataInput;

        try {
          const parsed = JSON.parse(metadataRaw);

          metadata = CompletionMetadataSchema.parse(parsed);
        } catch (error) {
          if (error instanceof SyntaxError) throw new BadRequestError('Invalid metadata JSON');
          throw error;
        }

        scorePercent = metadata.scorePercent;
        certificateOption = metadata.certificateOption;
        certificateNumber = metadata.certificateNumber;
      } else {
        if (!req.body) throw new BadRequestError('Invalid request body');
        const parsed = CompletionMetadataSchema.parse(req.body);
        scorePercent = parsed.scorePercent;
        certificateOption = parsed.certificateOption;
        certificateNumber = parsed.certificateNumber;
      }

      // Execute the completion logic
      try {
        let certificateUrl: string | undefined;
        let certificateFileId: string | undefined;

        // Upload custom certificate file if provided
        if (certificateOption === 'custom' && file && file.size > 0) {
          const uploadResult = await uploadToBucket(
            file,
            `certificates/${req.user!.associationSlug}/${moduleId}`,
            traceId,
          );

          const fileRecord = await prisma.file.create({
            data: {
              associationId: req.user!.associationId,
              originalName: file.originalname,
              storedName: uploadResult.key,
              mimeType: uploadResult.mimeType,
              extension: file.originalname.split('.').pop() || null,
              sizeBytes: uploadResult.sizeBytes,
              bucket: env.STORAGE_BUCKET,
              storageKey: uploadResult.key,
              url: uploadResult.url,
              uploadedById: actor.id,
            },
          });

          certificateUrl = uploadResult.url;
          certificateFileId = fileRecord.id;
        }

        const result = await completeAssignment({
          associationId: req.user!.associationId,
          moduleId: moduleId as string,
          userId: userId as string,
          actorId: actor.id,
          scorePercent,
          certificateOption,
          certificateUrl,
          certificateFileId,
          certificateNumber,
        });

        logger.info(
          { traceId },
          'POST /training/modules/{moduleId}/assignments/{userId}/complete - Success',
        );
        return success(res, { data: result }, 201);
      } catch (error) {
        if (error instanceof Error) throw new BadRequestError(error.message);
        throw new BadRequestError('Failed to complete assignment');
      }
    } catch (e) {
      next(e);
    }
  }),
];
