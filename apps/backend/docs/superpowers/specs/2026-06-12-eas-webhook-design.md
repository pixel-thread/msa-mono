# EAS Webhook Integration — Design Spec

**Status:** APPROVED
**Date:** 2026-06-12

## Purpose

Receive and store EAS (Expo Application Services) webhook events for build and submission lifecycle. Provides a queryable record of builds and submissions so users (or client apps) can check build status, download URLs, and submission info.

## Architecture

New `eas` feature module following the existing feature-based pattern. The webhook endpoint sits behind the `/api/v1/eas/webhook` path, uses HMAC-SHA1 signature verification (single shared secret via `EAS_WEBHOOK_SECRET` env var), and persists raw events plus structured build/submission records to PostgreSQL via Prisma.

## Endpoint

`POST /api/v1/eas/webhook`

- Public route (no auth middleware — webhook signature is the auth)
- Requires `express.text({ type: '*/*' })` to get raw body for signature verification
- Added to `API_PUBLIC_ROUTES` in `src/shared/constants/routes.ts`

## Webhook Verification

- Read `expo-signature` header (format: `sha1=<hex>`)
- Compute HMAC-SHA1 of raw request body using `EAS_WEBHOOK_SECRET`
- Compare using timing-safe equals (crypto.timingSafeEqual)
- Return 400 if signature missing or invalid

## Data Models (3 Prisma tables)

### EasWebhookEvent

Raw webhook event storage for idempotency and audit. Uses UUID as natural idempotency key (EAS sends a unique `id` per event).

| Field        | Type          | Notes                               |
| ------------ | ------------- | ----------------------------------- |
| id           | String (UUID) | EAS event `id` — natural PK         |
| eventType    | Enum          | BUILD / SUBMIT                      |
| platform     | String        | "ios" / "android"                   |
| status       | String        | "finished" / "errored" / "canceled" |
| payload      | Json          | Full raw payload                    |
| signature    | String        | Raw `expo-signature` header value   |
| processed    | Boolean       | Default false                       |
| processedAt  | DateTime?     | Null until processed                |
| errorMessage | String?       | If processing failed                |
| createdAt    | DateTime      | Auto                                |

### EasBuild

Structured build record. Created/updated from BUILD webhook events.

| Field            | Type          | Notes                               |
| ---------------- | ------------- | ----------------------------------- |
| id               | String (UUID) | EAS build `id`                      |
| accountName      | String        |                                     |
| projectName      | String        |                                     |
| platform         | String        | "ios" / "android"                   |
| status           | String        | "finished" / "errored" / "canceled" |
| buildProfile     | String        | e.g. "production", "preview"        |
| buildUrl         | String?       | Download URL — available on success |
| appVersion       | String?       |                                     |
| appBuildVersion  | String?       |                                     |
| runtimeVersion   | String?       |                                     |
| channel          | String?       | EAS Update channel                  |
| distribution     | String?       | "store" or null                     |
| gitCommitHash    | String?       |                                     |
| gitCommitMessage | String?       |                                     |
| sdkVersion       | String?       |                                     |
| cliVersion       | String?       |                                     |
| initiatingUserId | String?       |                                     |
| errorMessage     | String?       |                                     |
| errorCode        | String?       |                                     |
| message          | String?       | User-attached message               |
| runFromCI        | Boolean       |                                     |
| metrics          | Json?         | Build performance metrics           |
| createdAt        | DateTime      |                                     |
| completedAt      | DateTime?     |                                     |
| updatedAt        | DateTime      | Auto                                |
| rawEventId       | String        | FK → EasWebhookEvent.id             |

### EasSubmission

Structured submission record. Created/updated from SUBMIT webhook events.

| Field                    | Type          | Notes                               |
| ------------------------ | ------------- | ----------------------------------- |
| id                       | String (UUID) | EAS submission `id`                 |
| accountName              | String        |                                     |
| projectName              | String        |                                     |
| platform                 | String        | "ios" / "android"                   |
| status                   | String        | "finished" / "errored" / "canceled" |
| archiveUrl               | String?       | URL of the submitted archive        |
| turtleBuildId            | String?       | EAS Build ID if submitted from EAS  |
| initiatingUserId         | String?       |                                     |
| errorMessage             | String?       |                                     |
| errorCode                | String?       |                                     |
| logsUrl                  | String?       | Submission service logs             |
| submissionDetailsPageUrl | String?       |                                     |
| createdAt                | DateTime      |                                     |
| completedAt              | DateTime?     |                                     |
| updatedAt                | DateTime      | Auto                                |
| rawEventId               | String        | FK → EasWebhookEvent.id             |

## Processing Flow

1. Receive POST with raw body → verify `expo-signature` header
2. Upsert `EasWebhookEvent` using EAS event `id` as PK (idempotency)
3. If event type is BUILD: upsert `EasBuild` with structured fields from payload
4. If event type is SUBMIT: upsert `EasSubmission` with structured fields from payload
5. Mark `EasWebhookEvent.processed = true`
6. Return 200

On processing error, store error message but still return 200 to prevent EAS retries.

## File Structure

```
src/features/eas/
├── routes/
│   ├── index.ts              # Router setup with express.text() middleware
│   └── webhook.route.ts      # Handler array (verify → process → respond)
└── services/
    └── webhook.service.ts     # processEasWebhookEvent, event routing

prisma/schema/
├── eas-build.prisma           # EasBuild model
├── eas-submission.prisma      # EasSubmission model
└── eas-webhook-event.prisma   # EasWebhookEvent + event type enum

src/shared/constants/routes.ts # Add /eas/webhook to API_PUBLIC_ROUTES
src/env.ts                     # Add EAS_WEBHOOK_SECRET
src/index.ts                   # Mount easRouter at /api/v1/eas
```

## Env Vars

Add to `src/env.ts`:

```
EAS_WEBHOOK_SECRET: z.string('EAS_WEBHOOK_SECRET').min(16)
```

## Existing Patterns Followed

- Feature module under `src/features/<name>/` with routes/ and services/ subdirs
- Route handler as `RequestHandler[]` array with `asyncHandler` wrapper
- Webhook signature verification using `crypto.timingSafeEqual`
- `WebhookSignatureError` from shared errors
- Prisma models in separate `prisma/schema/<name>.prisma` files
- Public route registration via `API_PUBLIC_ROUTES`
- Return 200 on processing errors to prevent retries
