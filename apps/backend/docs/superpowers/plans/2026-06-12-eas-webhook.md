# EAS Webhook Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Receive, verify, and store EAS webhook events for build and submission lifecycle.

**Architecture:** New `eas` feature module following existing Express feature-based patterns. HMAC-SHA1 signature verification via `expo-signature` header. Raw events stored in `EasWebhookEvent` table, structured build/submission data in `EasBuild`/`EasSubmission` tables. Mounted at `/api/v1/eas/webhook`, registered as a public route.

**Tech Stack:** Express 5, TypeScript, Prisma 7 + PostgreSQL, Zod env validation, crypto (Node.js built-in)

---

### Task 1: Prisma Schema Models

**Files:**

- Create: `prisma/schema/eas-webhook-event.prisma`
- Create: `prisma/schema/eas-build.prisma`
- Create: `prisma/schema/eas-submission.prisma`

- [ ] **Step 1: Create webhook event model**

Create `prisma/schema/eas-webhook-event.prisma`:

```prisma
// ─────────────────────────────────────────────────────────────────────────────
// EAS Webhook Events
// ─────────────────────────────────────────────────────────────────────────────

enum EasWebhookEventType {
  BUILD
  SUBMIT

  @@map("eas_webhook_event_type")
}

model EasWebhookEvent {
  id           String               @id
  eventType    EasWebhookEventType
  platform     String
  status       String
  payload      Json
  signature    String
  processed    Boolean              @default(false)
  processedAt  DateTime?
  errorMessage String?
  createdAt    DateTime             @default(now())

  build        EasBuild?
  submission   EasSubmission?

  @@map("eas_webhook_events")
}
```

- [ ] **Step 2: Create build model**

Create `prisma/schema/eas-build.prisma`:

```prisma
// ─────────────────────────────────────────────────────────────────────────────
// EAS Builds
// ─────────────────────────────────────────────────────────────────────────────

model EasBuild {
  id                 String   @id
  accountName        String
  projectName        String
  platform           String
  status             String
  buildProfile       String
  buildUrl           String?
  appVersion         String?
  appBuildVersion    String?
  runtimeVersion     String?
  channel            String?
  distribution       String?
  gitCommitHash      String?
  gitCommitMessage   String?
  sdkVersion         String?
  cliVersion         String?
  initiatingUserId   String?
  errorMessage       String?
  errorCode          String?
  message            String?
  runFromCI          Boolean  @default(false)
  metrics            Json?
  createdAt          DateTime
  completedAt        DateTime?
  updatedAt          DateTime @updatedAt

  rawEventId         String   @unique
  rawEvent           EasWebhookEvent @relation(fields: [rawEventId], references: [id], onDelete: Cascade)

  @@map("eas_builds")
}
```

- [ ] **Step 3: Create submission model**

Create `prisma/schema/eas-submission.prisma`:

```prisma
// ─────────────────────────────────────────────────────────────────────────────
// EAS Submissions
// ─────────────────────────────────────────────────────────────────────────────

model EasSubmission {
  id                        String   @id
  accountName               String
  projectName               String
  platform                  String
  status                    String
  archiveUrl                String?
  turtleBuildId             String?
  initiatingUserId          String?
  errorMessage              String?
  errorCode                 String?
  logsUrl                   String?
  submissionDetailsPageUrl  String?
  createdAt                 DateTime
  completedAt               DateTime?
  updatedAt                 DateTime @updatedAt

  rawEventId                String   @unique
  rawEvent                  EasWebhookEvent @relation(fields: [rawEventId], references: [id], onDelete: Cascade)

  @@map("eas_submissions")
}
```

- [ ] **Step 4: Generate Prisma client**

Run: `npx prisma generate`
Expected: Generates Prisma client with `EasWebhookEvent`, `EasBuild`, `EasSubmission` models. No errors.

- [ ] **Step 5: Commit**

```bash
git add prisma/schema/eas-webhook-event.prisma prisma/schema/eas-build.prisma prisma/schema/eas-submission.prisma
git commit -m "feat: add Prisma schemas for EAS webhook events, builds, and submissions"
```

---

### Task 2: Env Var, Public Route, and App Mount

**Files:**

- Modify: `src/env.ts`
- Modify: `src/shared/constants/routes.ts`
- Modify: `src/index.ts`

- [ ] **Step 1: Add EAS_WEBHOOK_SECRET env var**

In `src/env.ts`, add after the Razorpay block (around line 48):

```typescript
  // EAS Webhook
  EAS_WEBHOOK_SECRET: z.string('EAS_WEBHOOK_SECRET').min(16),
```

- [ ] **Step 2: Register the webhook path as a public route**

In `src/shared/constants/routes.ts`, add `'/eas/webhook'` to the `API_PUBLIC_ROUTES` array:

```typescript
export const API_PUBLIC_ROUTES = [
  '/health',
  '/docs',
  '/auth/refresh',
  '/auth/sign-up',
  '/auth/sign-in',
  '/auth/sign-in/verify',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/payments/webhook',
  '/eas/webhook',
  '/logs',
] as const;
```

- [ ] **Step 3: Mount the eas router in index.ts**

In `src/index.ts`, add an import for the eas router after the other router imports (around line 22):

```typescript
import easRouter from '@feature/eas/routes/index';
```

Then add the mount line after the other route mounts (after the `/api/v1/dashboard` line or similar):

```typescript
app.use('/api/v1/eas', easRouter);
```

- [ ] **Step 4: Commit**

```bash
git add src/env.ts src/shared/constants/routes.ts src/index.ts
git commit -m "feat: add EAS_WEBHOOK_SECRET env var, register public route, mount eas router"
```

---

### Task 3: Webhook Service

**Files:**

- Create: `src/features/eas/services/webhook.service.ts`

- [ ] **Step 1: Write the failing test for webhook service**

Create `src/features/eas/__tests__/webhook.service.test.ts`:

```typescript
import { describe, it, expect, beforeAll } from '@jest/globals';
import { createEasWebhookService } from '../services/webhook.service';

describe('EAS webhook service', () => {
  const secret = 'test-secret-at-least-16-chars';

  it('should verify valid expo-signature', async () => {
    const service = createEasWebhookService(secret);
    const body = JSON.stringify({ event: 'test' });
    const crypto = await import('crypto');
    const hmac = crypto.createHmac('sha1', secret).update(body).digest('hex');
    const signature = `sha1=${hmac}`;
    expect(service.verifySignature(body, signature)).toBe(true);
  });

  it('should reject invalid signature', async () => {
    const service = createEasWebhookService(secret);
    const body = JSON.stringify({ event: 'test' });
    expect(service.verifySignature(body, 'sha1=invalid')).toBe(false);
  });

  it('should reject tampered body', async () => {
    const service = createEasWebhookService(secret);
    const body = JSON.stringify({ event: 'test' });
    const crypto = await import('crypto');
    const hmac = crypto.createHmac('sha1', secret).update(body).digest('hex');
    const signature = `sha1=${hmac}`;
    expect(service.verifySignature(body + 'tampered', signature)).toBe(false);
  });

  it('should reject missing sha1= prefix', async () => {
    const service = createEasWebhookService(secret);
    const body = JSON.stringify({ event: 'test' });
    expect(service.verifySignature(body, 'invalidsignature')).toBe(false);
  });

  it('should reject missing signature header', async () => {
    const service = createEasWebhookService(secret);
    const body = JSON.stringify({ event: 'test' });
    expect(service.verifySignature(body, '')).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/features/eas/__tests__/webhook.service.test.ts --forceExit --no-cache`
Expected: FAIL — import or function not found

- [ ] **Step 3: Create the webhook service**

Create `src/features/eas/services/webhook.service.ts`:

```typescript
import { prisma } from '@lib/prisma';
import { WebhookSignatureError } from '@errors';
import { env } from '@src/env';
import { logger } from '@src/shared/logger';
import crypto from 'node:crypto';

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

    const payload: EasEventPayload = JSON.parse(rawBody);

    // Detect event type from payload shape
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
        payload: JSON.parse(rawBody),
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
      metrics: payload.metrics ? JSON.parse(JSON.stringify(payload.metrics)) : null,
      createdAt: new Date(payload.createdAt),
      completedAt: payload.completedAt ? new Date(payload.completedAt) : null,
      rawEventId: eventId,
    },
    update: {
      status: payload.status,
      buildUrl: payload.artifacts?.buildUrl ?? null,
      errorMessage: payload.error?.message ?? null,
      errorCode: payload.error?.errorCode ?? null,
      completedAt: payload.completedAt ? new Date(payload.completedAt) : null,
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
      createdAt: new Date(payload.createdAt),
      completedAt: payload.completedAt ? new Date(payload.completedAt) : null,
      rawEventId: eventId,
    },
    update: {
      status: payload.status,
      archiveUrl: payload.archiveUrl ?? null,
      errorMessage: payload.submissionInfo?.error?.message ?? null,
      errorCode: payload.submissionInfo?.error?.errorCode ?? null,
      completedAt: payload.completedAt ? new Date(payload.completedAt) : null,
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/features/eas/__tests__/webhook.service.test.ts --forceExit --no-cache`
Expected: PASS — all 5 tests pass

- [ ] **Step 5: Commit**

```bash
git add src/features/eas/services/webhook.service.ts src/features/eas/__tests__/webhook.service.test.ts
git commit -m "feat: add EAS webhook service with HMAC-SHA1 verification and event processing"
```

---

### Task 4: Webhook Route and Routes Index

**Files:**

- Create: `src/features/eas/routes/webhook.route.ts`
- Create: `src/features/eas/routes/index.ts`

- [ ] **Step 1: Write the failing test for the webhook endpoint**

Create `src/features/eas/__tests__/webhook.route.test.ts`:

```typescript
import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import type { Express } from 'express';

describe('POST /api/v1/eas/webhook', () => {
  let app: Express;

  beforeAll(async () => {
    const mod = await import('@src/index');
    app = mod.default;
  });

  it('should return 400 when missing expo-signature header', async () => {
    const res = await request(app)
      .post('/api/v1/eas/webhook')
      .send({ id: 'test', platform: 'ios', status: 'finished' });
    expect(res.status).toBe(400);
  });

  it('should return 400 for invalid signature', async () => {
    const res = await request(app)
      .post('/api/v1/eas/webhook')
      .set('expo-signature', 'sha1=invalid')
      .send({ id: 'test', platform: 'ios', status: 'finished' });
    expect(res.status).toBe(400);
  });

  it('should not crash with empty body', async () => {
    const res = await request(app)
      .post('/api/v1/eas/webhook')
      .set('expo-signature', 'sha1=invalidsig')
      .send({});
    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.status).toBeLessThan(500);
  });
});
```

- [ ] **Step 2: Create the webhook route handler**

Create `src/features/eas/routes/webhook.route.ts`:

```typescript
// ---------------------------------------------------------------------------
// ENDPOINT:  POST /api/v1/eas/webhook
// SECURITY:  No auth — expo-signature HMAC-SHA1 verification is the auth
// PURPOSE:   Receive EAS Build and Submit webhook events, verify signature,
//            and persist structured data.
// ---------------------------------------------------------------------------

import { WebhookSignatureError } from '@errors';
import { getDefaultEasWebhookService } from '@feature/eas/services/webhook.service';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import type { RequestHandler } from 'express';
import type { Request, Response } from 'express';

const webhookService = getDefaultEasWebhookService();

export const webhook: RequestHandler[] = [
  asyncHandler(async (req: Request, res: Response) => {
    logger.info('POST /api/v1/eas/webhook - Request started');

    let rawBody: string;
    try {
      rawBody = req.body
        ? typeof req.body === 'string'
          ? req.body
          : JSON.stringify(req.body)
        : '';
    } catch {
      return res.status(400).json({ error: 'Failed to read request body' });
    }

    const signature = req.headers['expo-signature'] as string;
    if (!signature) {
      return res.status(400).json({ error: 'Missing expo-signature header' });
    }

    try {
      const result = await webhookService.processEvent(rawBody, signature);
      logger.info({ event: result.status }, 'POST /api/v1/eas/webhook - Success');
      return res.status(200).json({ status: result.status });
    } catch (error) {
      if (error instanceof WebhookSignatureError) {
        return res.status(400).json({ error: 'Invalid webhook signature' });
      }
      return res.status(200).json({ status: 'error', message: 'Webhook processing failed' });
    }
  }),
];
```

- [ ] **Step 3: Create the routes index**

Create `src/features/eas/routes/index.ts`:

```typescript
// ---------------------------------------------------------------------------
// EAS Routes Index
// ---------------------------------------------------------------------------

import { Router } from 'express';
import { webhook } from './webhook.route';

const router: Router = Router();

// Webhook does not need auth — HMAC signature is the auth
router.post('/webhook', ...webhook);

export default router;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/features/eas/__tests__/webhook.route.test.ts --forceExit --no-cache`
Expected: PASS — all 3 tests pass

- [ ] **Step 5: Run full test suite to check for regressions**

Run: `npx jest --runInBand --forceExit --no-cache 2>&1 | tail -30`
Expected: All existing tests still pass. Any failures must be the EAS tests only.

- [ ] **Step 6: Commit**

```bash
git add src/features/eas/routes/webhook.route.ts src/features/eas/routes/index.ts src/features/eas/__tests__/webhook.route.test.ts
git commit -m "feat: add EAS webhook route handler and routes index"
```

---

### Task 5: Update Prisma Types Export

**Files:**

- Modify: `src/shared/lib/prisma/types.ts`

- [ ] **Step 1: Add EAS model types to the export**

```typescript
export type {
  EasBuild,
  EasSubmission,
  EasWebhookEvent,
  EasWebhookEventType,
  // ...existing exports unchanged
} from '@prisma/client';
```

- [ ] **Step 2: Commit**

```bash
git add src/shared/lib/prisma/types.ts
git commit -m "chore: export EAS model types from prisma types"
```
