import { WebhookSignatureError } from '@errors';
import { prisma } from '@lib/prisma';
import { env } from '@src/env';
import { logger } from '@src/shared/logger';
import crypto from 'node:crypto';

function validateDate(value: string | undefined | null, field: string): Date {
  const date = new Date(value ?? '');
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date for ${field}: ${value}`);
  }
  return date;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EasBuildMetadata {
  appName?: string;
  appVersion?: string;
  appBuildVersion?: string;
  runtimeVersion?: string;
  cliVersion?: string;
  sdkVersion?: string;
  buildProfile?: string;
  distribution?: string;
  channel?: string;
  releaseChannel?: string;
  gitCommitHash?: string;
  gitCommitMessage?: string;
  message?: string;
  runFromCI?: boolean;
  credentialsSource?: string;
  isGitWorkingTreeDirty?: boolean;
}

interface EasBuildPayload {
  id: string;
  accountName: string;
  projectName: string;
  buildDetailsPageUrl?: string;
  appId?: string;
  initiatingUserId?: string;
  cancelingUserId?: string | null;
  platform: string;
  status: 'finished' | 'errored' | 'canceled';
  artifacts?: {
    buildUrl?: string;
    logsS3KeyPrefix?: string;
  };
  metadata?: EasBuildMetadata;
  metrics?: Record<string, unknown>;
  error?: { message: string; errorCode: string };
  createdAt: string;
  enqueuedAt?: string;
  provisioningStartedAt?: string;
  workerStartedAt?: string;
  completedAt?: string;
  updatedAt?: string;
  expirationDate?: string;
  priority?: string;
  resourceClass?: string;
  actualResourceClass?: string;
  maxRetryTimeMinutes?: number;
}

interface EasSubmissionInfo {
  error?: { message: string; errorCode: string };
  logsUrl?: string;
}

interface EasSubmitPayload {
  id: string;
  accountName: string;
  projectName: string;
  submissionDetailsPageUrl?: string;
  appId?: string;
  archiveUrl?: string;
  initiatingUserId?: string;
  cancelingUserId?: string | null;
  turtleBuildId?: string;
  platform: string;
  status: 'finished' | 'errored' | 'canceled';
  submissionInfo?: EasSubmissionInfo;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
  maxRetryTimeMinutes?: number;
}

type EasEventPayload = EasBuildPayload | EasSubmitPayload;

// ---------------------------------------------------------------------------
// Service factory (exported for testing)
// ---------------------------------------------------------------------------

export interface EasWebhookService {
  verifySignature(rawBody: string, signature: string): boolean;
  processEvent(
    rawBody: string,
    signature: string,
  ): Promise<{
    status: 'ok' | 'duplicate' | 'unhandled';
    eventId?: string;
  }>;
}

export function createEasWebhookService(secret: string): EasWebhookService {
  function verifySignature(rawBody: string, signature: string): boolean {
    if (!signature || !signature.startsWith('sha1=')) {
      return false;
    }

    const expectedSignature = crypto.createHmac('sha1', secret).update(rawBody).digest('hex');

    const providedSignature = signature.slice(5); // strip 'sha1=' prefix

    try {
      return crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(providedSignature));
    } catch {
      return false;
    }
  }

  async function processEvent(rawBody: string, signature: string) {
    if (!verifySignature(rawBody, signature)) {
      throw new WebhookSignatureError('Invalid EAS webhook signature');
    }

    let payload: EasEventPayload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      throw new WebhookSignatureError('Invalid JSON payload');
    }

    // Detect event type from payload shape.
    // EAS build payloads include `artifacts` and `buildDetailsPageUrl` fields
    // that submit payloads do not. This heuristic is stable across EAS versions
    // since the build/submit schemas diverge at the root level.
    // EAS does not provide an explicit top-level event type discriminator.
    const eventType =
      'artifacts' in payload || 'buildDetailsPageUrl' in payload
        ? ('BUILD' as const)
        : ('SUBMIT' as const);

    const eventId = payload.id;

    // Check for duplicate (idempotency)
    const existing = await prisma.easWebhookEvent.findUnique({
      where: { id: eventId },
    });

    if (existing?.processed) {
      return { status: 'duplicate' as const, eventId };
    }

    // Store raw event
    const webhookEvent = await prisma.easWebhookEvent.upsert({
      where: { id: eventId },
      create: {
        id: eventId,
        eventType,
        platform: payload.platform,
        status: payload.status,
        payload: JSON.stringify(payload),
        signature,
        processed: false,
      },
      update: {},
    });

    // Route to handler
    try {
      if (eventType === 'BUILD') {
        await handleBuildEvent(payload as EasBuildPayload, eventId);
      } else {
        await handleSubmitEvent(payload as EasSubmitPayload, eventId);
      }

      await prisma.easWebhookEvent.update({
        where: { id: webhookEvent.id },
        data: {
          processed: true,
          processedAt: new Date(),
        },
      });

      return { status: 'ok' as const, eventId };
    } catch (error) {
      await prisma.easWebhookEvent.update({
        where: { id: webhookEvent.id },
        data: {
          errorMessage: error instanceof Error ? error.message : 'Unknown processing error',
        },
      });

      throw error;
    }
  }

  return { verifySignature, processEvent };
}

// ---------------------------------------------------------------------------
// Event Handlers
// ---------------------------------------------------------------------------

async function handleBuildEvent(payload: EasBuildPayload, eventId: string): Promise<void> {
  const meta = payload.metadata;

  await prisma.easBuild.upsert({
    where: { id: payload.id },
    create: {
      id: payload.id,
      accountName: payload.accountName,
      projectName: payload.projectName,
      platform: payload.platform,
      status: payload.status,
      buildProfile: meta?.buildProfile ?? 'unknown',
      buildUrl: payload.artifacts?.buildUrl ?? null,
      appVersion: meta?.appVersion ?? null,
      appBuildVersion: meta?.appBuildVersion ?? null,
      runtimeVersion: meta?.runtimeVersion ?? null,
      channel: meta?.channel ?? null,
      distribution: meta?.distribution ?? null,
      gitCommitHash: meta?.gitCommitHash ?? null,
      gitCommitMessage: meta?.gitCommitMessage ?? null,
      sdkVersion: meta?.sdkVersion ?? null,
      cliVersion: meta?.cliVersion ?? null,
      initiatingUserId: payload.initiatingUserId ?? null,
      errorMessage: payload.error?.message ?? null,
      errorCode: payload.error?.errorCode ?? null,
      message: meta?.message ?? null,
      runFromCI: meta?.runFromCI ?? false,
      metrics: payload.metrics ? JSON.stringify(payload.metrics) : undefined,
      createdAt: validateDate(payload.createdAt, 'createdAt'),
      completedAt: payload.completedAt ? validateDate(payload.completedAt, 'completedAt') : null,
      rawEventId: eventId,
    },
    update: {
      status: payload.status,
      buildUrl: payload.artifacts?.buildUrl ?? null,
      errorMessage: payload.error?.message ?? null,
      errorCode: payload.error?.errorCode ?? null,
      completedAt: payload.completedAt ? validateDate(payload.completedAt, 'completedAt') : null,
    },
  });

  logger.info({ buildId: payload.id, status: payload.status }, 'EAS build event processed');
}

async function handleSubmitEvent(payload: EasSubmitPayload, eventId: string): Promise<void> {
  await prisma.easSubmission.upsert({
    where: { id: payload.id },
    create: {
      id: payload.id,
      accountName: payload.accountName,
      projectName: payload.projectName,
      platform: payload.platform,
      status: payload.status,
      archiveUrl: payload.archiveUrl ?? null,
      turtleBuildId: payload.turtleBuildId ?? null,
      initiatingUserId: payload.initiatingUserId ?? null,
      errorMessage: payload.submissionInfo?.error?.message ?? null,
      errorCode: payload.submissionInfo?.error?.errorCode ?? null,
      logsUrl: payload.submissionInfo?.logsUrl ?? null,
      submissionDetailsPageUrl: payload.submissionDetailsPageUrl ?? null,
      createdAt: validateDate(payload.createdAt, 'createdAt'),
      completedAt: payload.completedAt ? validateDate(payload.completedAt, 'completedAt') : null,
      rawEventId: eventId,
    },
    update: {
      status: payload.status,
      archiveUrl: payload.archiveUrl ?? null,
      errorMessage: payload.submissionInfo?.error?.message ?? null,
      errorCode: payload.submissionInfo?.error?.errorCode ?? null,
      completedAt: payload.completedAt ? validateDate(payload.completedAt, 'completedAt') : null,
    },
  });

  logger.info({ submissionId: payload.id, status: payload.status }, 'EAS submit event processed');
}

// ---------------------------------------------------------------------------
// Convenience export (uses env var by default)
// ---------------------------------------------------------------------------

let defaultService: EasWebhookService | null = null;

export function getDefaultEasWebhookService(): EasWebhookService {
  if (!defaultService) {
    defaultService = createEasWebhookService(env.EAS_WEBHOOK_SECRET);
  }
  return defaultService;
}
