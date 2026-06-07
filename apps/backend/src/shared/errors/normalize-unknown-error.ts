import { Prisma } from '@prisma/client';
import { env } from '@src/env';
import { errors } from 'jose';
import { ZodError } from 'zod';

import { ContextStore } from '../lib';
import { logger } from '../logger';

import { AppError } from './classes/base';
import {
  BadRequestError,
  NotFoundError,
  PaymentError,
  UnauthorizedError,
  ValidationError,
} from './classes/http-errors';

/** Type guard to check if an error is a Prisma-specific error. */
const isPrismaError = (
  error: unknown,
): error is
  | Prisma.PrismaClientKnownRequestError
  | Prisma.PrismaClientUnknownRequestError
  | Prisma.PrismaClientValidationError
  | Prisma.PrismaClientRustPanicError
  | Prisma.PrismaClientInitializationError => {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError ||
    error instanceof Prisma.PrismaClientUnknownRequestError ||
    error instanceof Prisma.PrismaClientValidationError ||
    error instanceof Prisma.PrismaClientInitializationError
  );
};

/** Type guard to check if an error is a JWT validation error. */
const isJwtError = (error: unknown): error is errors.JWTClaimValidationFailed => {
  return error instanceof errors.JOSEError;
};

/** Checks whether an unknown value is a Supabase Storage error-shaped object. */
export function isSupabaseStorageError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;

  const err = error as Record<string, unknown>;

  return (
    err.name === 'StorageError' ||
    err.name === 'StorageUnknownError' ||
    typeof err.statusCode === 'string' ||
    typeof (err.error as Record<string, unknown> | undefined)?.message === 'string'
  );
}

/**
 * Converts an unknown error into a typed {@link AppError}.
 * Handles JWT, Zod, Prisma, Supabase, and generic errors.
 */
export const normalizeUnknownError = (error: unknown): AppError => {
  const isProd = env.NODE_ENV === 'production';
  const userId = ContextStore.getByKey('userId');
  const traceId = ContextStore.getByKey('requestId');
  const associationId = ContextStore.getByKey('associationId');

  if (isJwtError(error)) {
    logger.error({ error, traceId, userId, associationId }, error.message);
    return new UnauthorizedError(error.message);
  }

  if (error instanceof UnauthorizedError) {
    return new UnauthorizedError(error.message);
  }

  if (error instanceof NotFoundError) {
    logger.error({ error, traceId, userId, associationId }, error.message);
    return new NotFoundError(error.message);
  }

  if (isSupabaseStorageError(error)) {
    logger.error({ error, traceId, userId, associationId }, 'Supabase storage error');
    return new BadRequestError('Supabase storage error');
  }

  if (error instanceof ZodError) {
    logger.info({ error, traceId, userId, associationId }, error.message);
    return new ValidationError(error.message, error.issues);
  }

  if (error instanceof PaymentError) {
    logger.error({ error, traceId, userId, associationId }, error.message);
    return new PaymentError(error.message, error.code, error.statusCode);
  }

  if (isPrismaError(error)) {
    logger.error({ error, traceId, userId, associationId }, 'Database error');
    return new AppError('DATABASE_ERROR', isProd ? 'Database error' : error.message, 500);
  }

  if (error instanceof AppError) {
    logger.error({ error, traceId, userId, associationId }, error.message);
    return error;
  }

  const message = error instanceof Error ? error.message : 'An unexpected error occurred';

  const displayMessage = isProd ? 'Internal Server Error' : message;

  logger.error({ error, traceId, userId, associationId }, displayMessage);
  return new AppError('INTERNAL_ERROR', displayMessage, 500);
};
