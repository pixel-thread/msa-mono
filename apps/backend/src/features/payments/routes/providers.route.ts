// ---------------------------------------------------------------------------
// ENDPOINT:  CRUD /api/payments/providers
// SECURITY:  President role for mutations, Member for read/status checks
// PURPOSE:   Manage payment providers per association — create, read, update,
//            delete, activate/deactivate, and test connectivity.
// ---------------------------------------------------------------------------

import { BadRequestError, NotFoundError } from '@errors';
import {
  createTestPaymentOrder,
  verifyTestPayment,
} from '@feature/payments/services/payment.service';
import {
  createProvider,
  deleteProvider,
  getActiveProvider,
  getProviderById,
  getProvidersByAssociation,
  setActiveProvider,
  updateProvider,
} from '@feature/payments/services/payment-provider.service';
import {
  ProviderIdParamSchema,
  UpdatePaymentProviderSchema,
  UpsertPaymentProviderSchema,
  VerifyPaymentSchema,
} from '@feature/payments/validators';
import { validate } from '@lib/validate';
import { UserRole } from '@prisma/client';

import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { RequestHandler } from 'express';
import type { NextFunction, Request, Response } from 'express';

// ===========================================================================
// LIST GET /api/payments/providers
// ===========================================================================

export const listProviders: RequestHandler[] = [
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // --- Log: request started ---
    logger.info({ traceId }, 'GET /api/payments/providers - Request started');

    // --- Business logic: list all providers ---
    const providers = await getProvidersByAssociation(req.user!.associationId);

    // --- Log: success ---
    logger.info({ traceId, count: providers.length }, 'GET /api/payments/providers - Success');

    // --- Response ---
    return success(res, { data: providers });
  }),
];

// ===========================================================================
// CREATE POST /api/payments/providers
// ===========================================================================

export const createProviderHandler: RequestHandler[] = [
  // Step 1: Validate request body
  validate({ body: UpsertPaymentProviderSchema }),

  // Step 2: Execute
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // --- Log: request started ---
    logger.info(
      { traceId, provider: req.body.provider },
      'POST /api/payments/providers - Request started',
    );

    // --- Business logic: create provider ---
    const result = await createProvider({
      associationId: req.user!.associationId,
      provider: req.body.provider,
      keyId: req.body.keyId,
      keySecret: req.body.keySecret,
      webhookSecret: req.body.webhookSecret,
      isActive: req.body.isActive,
    });

    // --- Log: success ---
    logger.info({ traceId, providerId: result.id }, 'POST /api/payments/providers - Success');

    // --- Response ---
    return success(res, { data: result }, 201);
  }),
];

// ===========================================================================
// STATUS GET /api/payments/providers/status
// ===========================================================================

export const providerStatus: RequestHandler[] = [
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // --- Log: request started ---
    logger.info({ traceId }, 'GET /api/payments/providers/status - Request started');

    // --- Auth: enforce MEMBER role ---
    const user = await withRole(req, UserRole.MEMBER);
    logger.info(
      { traceId, userId: user.id },
      'GET /api/payments/providers/status - User authorized',
    );

    // --- Business logic: check provider status ---
    const providerByAssociation = await getProvidersByAssociation(req.user!.associationId);
    if (!providerByAssociation) throw new NotFoundError('No Provider setup');
    const activeProvider = await getActiveProvider(req.user!.associationId);
    if (!activeProvider) throw new NotFoundError('Provider not found');

    // --- Log: success ---
    logger.info(
      { traceId, isActive: activeProvider.isActive },
      'GET /api/payments/providers/status - Success',
    );

    // --- Response ---
    return success(res, { data: { status: activeProvider.isActive } });
  }),
];

// ===========================================================================
// GET /api/payments/providers/:providerId
// ===========================================================================

export const getProvider: RequestHandler[] = [
  // Step 1: Validate path params
  validate({ params: ProviderIdParamSchema }),

  // Step 2: Execute
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // --- Log: request started ---
    logger.info(
      { traceId, providerId: req.params.providerId },
      'GET /api/payments/providers/[providerId] - Request started',
    );

    // --- Auth: enforce PRESIDENT role ---
    await withRole(req, UserRole.PRESIDENT);

    logger.info(
      { traceId, providerId: req.params.providerId },
      'GET /api/payments/providers/[providerId] - User authorized',
    );

    // --- Business logic: fetch provider ---
    const provider = await getProviderById(
      req.params.providerId as string,
      req.user!.associationId,
    );
    if (!provider) throw new NotFoundError('Provider not found');

    // --- Log: success ---
    logger.info(
      { traceId, providerId: req.params.providerId },
      'GET /api/payments/providers/[providerId] - Success',
    );

    // --- Response ---
    return success(res, { data: provider });
  }),
];

// ===========================================================================
// PATCH /api/payments/providers/:providerId
// ===========================================================================

// ===========================================================================
// PATCH /api/payments/providers/:providerId
// ===========================================================================

export const updateProviderHandler: RequestHandler[] = [
  // Step 1: Validate params and body
  validate({ params: ProviderIdParamSchema, body: UpdatePaymentProviderSchema }),

  // Step 2: Execute
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // --- Log: request started ---
    logger.info(
      { traceId, providerId: req.params.providerId },
      'PATCH /api/payments/providers/[providerId] - Request started',
    );

    // --- Auth: enforce PRESIDENT role ---
    await withRole(req, UserRole.PRESIDENT);
    logger.info(
      { traceId, providerId: req.params.providerId },
      'PATCH /api/payments/providers/[providerId] - User authorized',
    );

    // --- Business logic: update provider ---
    logger.info(
      { traceId, providerId: req.params.providerId },
      'PATCH /api/payments/providers/[providerId] - Updating provider',
    );

    const result = await updateProvider(req.params.providerId as string, req.user!.associationId, {
      keyId: req.body?.keyId,
      keySecret: req.body?.keySecret,
      webhookSecret: req.body?.webhookSecret,
      isActive: req.body?.isActive,
    });

    // --- Log: success ---
    logger.info(
      { traceId, providerId: req.params.providerId },
      'PATCH /api/payments/providers/[providerId] - Success',
    );

    // --- Response ---
    return success(res, { data: result });
  }),
];

// ===========================================================================
// DELETE /api/payments/providers/:providerId
// ===========================================================================

export const deleteProviderHandler: RequestHandler[] = [
  // Step 1: Validate path params
  validate({ params: ProviderIdParamSchema }),

  // Step 2: Execute
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // --- Log: request started ---
    logger.info(
      { traceId, providerId: req.params.providerId },
      'DELETE /api/payments/providers/[providerId] - Request started',
    );

    // --- Auth: enforce PRESIDENT role ---
    await withRole(req, UserRole.PRESIDENT);
    logger.info(
      { traceId, providerId: req.params.providerId },
      'DELETE /api/payments/providers/[providerId] - User authorized',
    );

    // --- Business logic: delete provider ---
    await deleteProvider(req.params.providerId as string, req.user!.associationId);

    // --- Log: success ---
    logger.info(
      { traceId, providerId: req.params.providerId },
      'DELETE /api/payments/providers/[providerId] - Success',
    );

    // --- Response ---
    return success(res, { data: null, message: 'Provider deleted successfully' });
  }),
];

// ===========================================================================
// ACTIVATE POST /api/payments/providers/:providerId/activate
// ===========================================================================

export const activateProvider: RequestHandler[] = [
  // Step 1: Validate path params
  validate({ params: ProviderIdParamSchema }),

  // Step 2: Execute
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // --- Log: request started ---
    logger.info(
      { traceId, providerId: req.params?.providerId },
      'POST /api/payments/providers/[providerId]/activate - Request started',
    );

    // --- Auth: enforce PRESIDENT role ---
    await withRole(req, UserRole.PRESIDENT);
    logger.info(
      { traceId, providerId: req.params?.providerId },
      'POST /api/payments/providers/[providerId]/activate - User authorized',
    );

    // --- Business logic: toggle provider activation ---
    const providerId = req.params?.providerId;
    if (!providerId) throw new BadRequestError('Invalid provider ID');
    const provderExist = await getProviderById(providerId as string, req.user!.associationId);
    if (!provderExist) throw new NotFoundError('Provider not found');

    logger.info(
      { traceId, providerId },
      'POST /api/payments/providers/[providerId]/activate - Toggling provider activation',
    );
    const result = await setActiveProvider(provderExist.id, req.user!.associationId);
    const activatedMessage = 'Provider successfully activated';
    const deActivatedMessage = 'Provider successfully de-activated';

    // --- Log: success ---
    logger.info(
      { traceId, providerId, isActive: result.isActive },
      'POST /api/payments/providers/[providerId]/activate - Success',
    );

    // --- Response ---
    return success(res, {
      data: result,
      message: result.isActive ? activatedMessage : deActivatedMessage,
    });
  }),
];

// ===========================================================================
// TEST POST /api/payments/providers/:providerId/test
// ===========================================================================

export const testProvider: RequestHandler[] = [
  // Step 1: Validate path params
  validate({ params: ProviderIdParamSchema }),

  // Step 2: Execute
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // --- Log: request started ---
    logger.info(
      { traceId, providerId: req.params.providerId },
      'POST /api/payments/providers/[providerId]/test - Request started',
    );

    // --- Auth: enforce PRESIDENT role ---
    const user = await withRole(req, UserRole.PRESIDENT);
    logger.info(
      { traceId, userId: user.id, providerId: req.params.providerId },
      'POST /api/payments/providers/[providerId]/test - User authorized',
    );

    // --- Business logic: create test payment order ---
    const provider = await getProviderById(
      req.params.providerId as string,
      req.user!.associationId,
    );
    if (!provider) throw new NotFoundError('Provider not found');
    // Test payments require Razorpay — no other providers support checkout tests
    if (provider.provider !== 'RAZORPAY') {
      throw new BadRequestError('Test payments are only supported for Razorpay providers');
    }

    logger.info(
      { traceId, providerId: req.params.providerId },
      'POST /api/payments/providers/[providerId]/test - Creating test payment order',
    );
    const options = await createTestPaymentOrder({
      associationId: req.user!.associationId,
      userId: user.id,
      providerId: req.params.providerId as string,
    });

    // --- Log: success ---
    logger.info(
      { traceId, providerId: req.params.providerId, order: options },
      'POST /api/payments/providers/[providerId]/test - Success',
    );

    // --- Response ---
    return success(res, { data: options, message: 'Test payment order created successfully' }, 201);
  }),
];

// ===========================================================================
// VERIFY TEST POST /api/payments/providers/:providerId/test/verify
// ===========================================================================

export const verifyTestProvider: RequestHandler[] = [
  // Step 1: Validate params and body
  validate({ params: ProviderIdParamSchema, body: VerifyPaymentSchema }),

  // Step 2: Execute
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // --- Log: request started ---
    logger.info(
      { traceId },
      'POST /api/payments/providers/[providerId]/test/verify - Request started',
    );

    // --- Auth: enforce PRESIDENT role ---
    await withRole(req, UserRole.PRESIDENT);
    logger.info(
      { traceId },
      'POST /api/payments/providers/[providerId]/test/verify - User authorized',
    );

    // --- Business logic: verify test payment signature ---
    logger.info(
      { traceId, razorpayOrderId: req.body.razorpayOrderId },
      'POST /api/payments/providers/[providerId]/test/verify - Verifying test payment',
    );
    const result = await verifyTestPayment({
      razorpayOrderId: req.body.razorpayOrderId,
      razorpayPaymentId: req.body.razorpayPaymentId,
      razorpaySignature: req.body.razorpaySignature,
    });

    // --- Log: success ---
    logger.info({ traceId }, 'POST /api/payments/providers/[providerId]/test/verify - Success');

    // --- Response ---
    return success(res, {
      data: result,
      message: 'Test payment verified and completed successfully',
    });
  }),
];
