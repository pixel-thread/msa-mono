// ---------------------------------------------------------------------------
// External libs
// ---------------------------------------------------------------------------

import { BadRequestError, ForbiddenError, NotFoundError } from '@errors';
// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------
import {
  createMemberType,
  deleteMemberType as _deleteMemberType,
  findManyMemberTypes,
  findUniqueMemberType,
  updateMemberType,
} from '@feature/member-types/services';
// ---------------------------------------------------------------------------
// Validators / Types
// ---------------------------------------------------------------------------
import {
  CreateMemberTypeSchema,
  MemberTypeParamsSchema,
  UpdateMemberTypeSchema,
} from '@feature/member-types/validators';
// ---------------------------------------------------------------------------
// Shared utilities
// ---------------------------------------------------------------------------
import { validate } from '@lib/validate';
// ---------------------------------------------------------------------------
// Prisma
// ---------------------------------------------------------------------------
import { UserRole } from '@prisma/client';
import { getAssociation } from '@services/association/get-association';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { NextFunction, Request, Response } from 'express';
import { type RequestHandler } from 'express';

// ---------------------------------------------------------------------------
// GET /api/member-types  –  List all member types
// Security: MEMBER role required
// ---------------------------------------------------------------------------

export const getMemberTypes: RequestHandler[] = [
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // ---- Resolve association & log request ---------------------------------

    const association = await getAssociation(req);
    logger.info(
      { traceId, associationId: association.id },
      'GET /api/member-types - Request started',
    );

    // ---- Authorize (MEMBER role) -------------------------------------------

    const user = await withRole(req, UserRole.MEMBER);
    logger.info({ traceId, userId: user.id }, 'GET /api/member-types - User authorized');

    // ---- Business logic -----------------------------------------------------

    const memberTypes = await findManyMemberTypes({ associationId: association.id });

    // ---- Result ------------------------------------------------------------

    logger.info({ traceId, count: memberTypes.length }, 'GET /api/member-types - Success');
    return success(res, { data: memberTypes });
  }),
];

// ---------------------------------------------------------------------------
// POST /api/member-types  –  Create a new member type
// Security: PRESIDENT role required
// ---------------------------------------------------------------------------

export const postMemberType: RequestHandler[] = [
  validate({ body: CreateMemberTypeSchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // ---- Resolve association & log request ---------------------------------

    const association = await getAssociation(req);
    logger.info(
      { traceId, associationId: association.id },
      'POST /api/member-types - Request started',
    );

    // ---- Validate ----------------------------------------------------------

    if (!req.body) throw new BadRequestError('Invalid request body');

    // ---- Authorize (PRESIDENT role) ----------------------------------------

    const user = await withRole(req, UserRole.PRESIDENT);
    logger.info({ traceId, userId: user.id }, 'POST /api/member-types - User authorized');

    // ---- Business logic ----------------------------------------------------

    const memberType = await createMemberType({
      associationId: association.id,
      actorId: user.id,
      data: req.body,
    });

    // ---- Result ------------------------------------------------------------

    logger.info({ traceId, memberTypeId: memberType?.id }, 'POST /api/member-types - Success');
    return success(res, { data: memberType }, 201);
  }),
];

// ---------------------------------------------------------------------------
// GET /api/member-types/:memberTypeId  –  Retrieve a member type by ID
// Security: MEMBER role required
// ---------------------------------------------------------------------------

export const getMemberTypeById: RequestHandler[] = [
  validate({ params: MemberTypeParamsSchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // ---- Resolve association & log request ---------------------------------

    const association = await getAssociation(req);
    logger.info(
      { traceId, associationId: association.id },
      'GET /api/member-types/[memberTypeId] - Request started',
    );

    // ---- Validate ----------------------------------------------------------

    if (!req.params.memberTypeId) throw new BadRequestError('Invalid member type ID');

    // ---- Authorize (MEMBER role) -------------------------------------------

    const user = await withRole(req, UserRole.MEMBER);
    logger.info(
      { traceId, userId: user.id },
      'GET /api/member-types/[memberTypeId] - User authorized',
    );

    // ---- Business logic ----------------------------------------------------

    const memberTypeId = req.params.memberTypeId as string;
    const memberType = await findUniqueMemberType({ associationId: association.id, memberTypeId });

    if (!memberType) throw new NotFoundError('Member type not found');

    // ---- Result ------------------------------------------------------------

    logger.info({ traceId, memberTypeId }, 'GET /api/member-types/[memberTypeId] - Success');
    return success(res, { data: memberType, message: 'Member type found' });
  }),
];

// ---------------------------------------------------------------------------
// PATCH /api/member-types/:memberTypeId  –  Update a member type
// Security: PRESIDENT role required
// ---------------------------------------------------------------------------

export const patchMemberType: RequestHandler[] = [
  validate({ body: UpdateMemberTypeSchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // ---- Resolve association & log request ---------------------------------

    const association = await getAssociation(req);
    logger.info(
      { traceId, associationId: association.id },
      'PATCH /api/member-types/[memberTypeId] - Request started',
    );

    // ---- Validate ----------------------------------------------------------

    if (!req.params.memberTypeId) throw new ForbiddenError('Invalid member type ID');
    if (!req.body) throw new ForbiddenError('Invalid request body');

    // ---- Authorize (PRESIDENT role) ----------------------------------------

    const user = await withRole(req, UserRole.PRESIDENT);
    logger.info(
      { traceId, userId: user.id },
      'PATCH /api/member-types/[memberTypeId] - User authorized',
    );

    // ---- Business logic ----------------------------------------------------

    const memberTypeId = req.params.memberTypeId as string;
    const memberType = await updateMemberType({
      associationId: association.id,
      actorId: user.id,
      memberTypeId,
      data: req.body,
    });

    // ---- Result ------------------------------------------------------------

    logger.info({ traceId, memberTypeId }, 'PATCH /api/member-types/[memberTypeId] - Success');
    return success(res, { data: memberType, message: 'Member type updated successfully' });
  }),
];

// ---------------------------------------------------------------------------
// DELETE /api/member-types/:memberTypeId  –  Delete a member type
// Security: PRESIDENT role required. Refuses if users or plans are linked.
// ---------------------------------------------------------------------------

export const deleteMemberType: RequestHandler[] = [
  validate({ params: MemberTypeParamsSchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // ---- Resolve association & log request ---------------------------------

    const association = await getAssociation(req);
    logger.info(
      { traceId, associationId: association.id },
      'DELETE /api/member-types/[memberTypeId] - Request started',
    );

    // ---- Validate ----------------------------------------------------------

    if (!req.params.memberTypeId) throw new ForbiddenError('Invalid member type ID');

    // ---- Authorize (PRESIDENT role) ----------------------------------------

    const user = await withRole(req, UserRole.PRESIDENT);
    logger.info(
      { traceId, userId: user.id },
      'DELETE /api/member-types/[memberTypeId] - User authorized',
    );

    // ---- Business logic -----------------------------------------------------

    const memberTypeId = req.params.memberTypeId as string;

    await _deleteMemberType({ associationId: association.id, actorId: user.id, memberTypeId });

    // ---- Result ------------------------------------------------------------

    logger.info({ traceId, memberTypeId }, 'DELETE /api/member-types/[memberTypeId] - Success');
    return success(res, { data: null, message: 'Member type deleted successfully' });
  }),
];
