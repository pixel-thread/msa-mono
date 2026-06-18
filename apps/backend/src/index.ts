import adminRouter from '@feature/admin/routes/index';
import announcementsRouter from '@feature/announcements/routes/index';
import associationsRouter from '@feature/associations/routes/index';
import auditLogsRouter from '@feature/audit-logs/routes/index';
import authRouter from '@feature/auth/routes/index';
import complianceRouter from '@feature/compliance/routes/index';
import consentRouter from '@feature/consent/routes/index';
import contributions from '@feature/contributions/routes/index';
import cronRouter from '@feature/cron/routes/index';
import dashboardRouter from '@feature/dashboard/routes/index';
import declarationsRouter from '@feature/declarations/routes/index';
import dsarRouter from '@feature/dsar/routes/index';
import easRouter from '@feature/eas/routes/index';
import healthRouter from '@feature/health/routes/index';
import ledgerRouter from '@feature/ledger/routes/index';
import logsRouter from '@feature/logs/routes/index';
import meetingsRouter from '@feature/meetings/routes/index';
import memberTypesRouter from '@feature/member-types/routes/index';
import membersRouter from '@feature/members/routes/index';
import membershipApplicationsRouter from '@feature/membership-applications/routes/index';
import notificationsRouter from '@feature/notifications/routes/index';
import paymentsRouter from '@feature/payments/routes/index';
import plansRouter from '@feature/plans/routes/index';
import trainingRouter from '@feature/training/routes/index';
import userRouter from '@feature/user/routes/index';
import { contextMiddleware } from '@middleware/context';
import { cors } from '@middleware/cors';
// import { csrf } from '@middleware/csrf';
import { errorHandler } from '@middleware/error-handler';
import { rateLimiter } from '@middleware/rate-limiter';
import { securityHeaders } from '@middleware/security-headers';
import { timeout } from '@middleware/timeout';
import { env } from '@src/env';
import { logger } from '@src/shared/logger';
import cookieParser from 'cookie-parser';
import express from 'express';
import path from 'node:path';

export function createApp(): express.Express {
  const app = express();

  /**
   * -------------------------------------------------------
   * Global Middleware
   * -------------------------------------------------------
   */

  app.use(cors);
  app.use(contextMiddleware);
  app.use(cookieParser(env.FIELD_ENCRYPTION_KEY));
  // app.use(csrf);
  app.use(securityHeaders);
  app.use(rateLimiter);
  app.use(express.json({ limit: '5mb' }));
  app.use(timeout(10000));

  /**
   * -------------------------------------------------------
   * Feature Routes
   * -------------------------------------------------------
   */

  app.use('/api/v1/admin', adminRouter);
  app.use('/api/v1/announcements', announcementsRouter);
  app.use('/api/v1/associations', associationsRouter);
  app.use('/api/v1/audit-logs', auditLogsRouter);
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/contributions', contributions);
  app.use('/api/v1/declarations', declarationsRouter);
  app.use('/api/v1/compliance', complianceRouter);
  app.use('/api/v1/consent', consentRouter);
  app.use('/api/v1/cron', cronRouter);
  app.use('/api/v1/dashboard', dashboardRouter);
  app.use('/api/v1/dsar', dsarRouter);
  app.use('/api/v1/health', healthRouter);
  app.use('/api/v1/ledger', ledgerRouter);
  app.use('/api/v1/logs', logsRouter);
  app.use('/api/v1/meetings', meetingsRouter);
  app.use('/api/v1/member-types', memberTypesRouter);
  app.use('/api/v1/members', membersRouter);
  app.use('/api/v1/membership-applications', membershipApplicationsRouter);
  app.use('/api/v1/notifications', notificationsRouter);
  app.use('/api/v1/payments', paymentsRouter);
  app.use('/api/v1/plans', plansRouter);
  app.use('/api/v1/training', trainingRouter);
  app.use('/api/v1/user', userRouter);
  app.use('/api/v1/eas', easRouter);

  /**
   * -------------------------------------------------------
   * Static Files (uploaded images, etc.)
   * -------------------------------------------------------
   * Serves uploaded files from {SFTP_ROOT}/{STORAGE_BUCKET}
   * so URLs like {PUBLIC_BASE_URL}/announcements/... resolve
   * to the correct filesystem path. Mounted at /assets so
   * a frontend proxy at /assets/ → backend /assets/ works.
   */
  const storageRoot = path.posix.join('/', env.SFTP_ROOT, env.STORAGE_BUCKET);
  app.use('/assets', express.static(storageRoot, { dotfiles: 'deny', maxAge: '1d', index: false }));

  app.get('/', (_, res) => {
    return res.redirect(`${env.BASE_URL}`);
  });

  /**
   * -------------------------------------------------------
   * 404 Handler
   * -------------------------------------------------------
   */

  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      timestamp: new Date().toISOString(),
      message: 'Route not found',
    });
  });

  /**
   * -------------------------------------------------------
   * Global Error Handler
   * -------------------------------------------------------
   */

  app.use(errorHandler);

  return app;
}

const app = createApp();

// Note: Node 15+ throws by default on unhandledRejection regardless of this handler.
// This catches rejections in Node <15. For Node 15+, set --unhandled-rejections=warn
// or ensure zero unhandled rejections across the codebase.

process.on('unhandledRejection', (reason) => {
  logger.error({ error: reason }, 'Unhandled promise rejection — keeping server alive');
});

process.on('uncaughtException', (error) => {
  logger.error({ error }, 'Uncaught exception — keeping server alive');
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(env.PORT, () => {
    logger.debug(`🚀 Express API running on http://localhost:${env.PORT}`);
    logger.debug(`Environment: ${env.NODE_ENV}`);
  });
}

export default app;
