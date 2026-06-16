# Error Handling Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 9 identified HIGH and MEDIUM error-handling issues that could crash the server, corrupt data, or leak implementation details.

**Architecture:** Surgical fixes across 7 files in the Express 5 backend — no structural changes, only targeted guards around known failure points. Each fix is self-contained and independently testable.

**Tech Stack:** Express 5, Prisma ORM, JWT (jose), Zod, Razorpay SDK, Resend (email)

---

### Task 1: `normalizeUnknownError` — null-safe env access (H1)

**Problem:** `normalizeUnknownError()` is called inside the error handler. If called during boot before `env` is initialized, accessing `env.NODE_ENV` throws, causing the error handler itself to crash (recursive failure).

**Files:**
- Modify: `src/shared/errors/normalize-unknown-error.ts:59`

- [ ] **Step 1: Add null-safe env access**

Change line 59 from:
```typescript
const isProd = env.NODE_ENV === 'production';
```
to:
```typescript
const isProd = (env?.NODE_ENV ?? 'production') === 'production';
```

- [ ] **Step 2: Verify the fix compiles**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add src/shared/errors/normalize-unknown-error.ts
git commit -m "fix: null-safe env access in error normalizer"
```

---

### Task 2: Sanitize JWT error messages in auth (H3)

**Problem:** `normalizeUnknownError` passes JWT library error messages directly to clients in non-production environments. Messages like `'"exp" claim is expired'` leak implementation details about the JWT library and claim structure.

**Files:**
- Modify: `src/shared/errors/normalize-unknown-error.ts:66`

- [ ] **Step 1: Use generic message for JWT errors**

Change line 64-67 from:
```typescript
if (isJwtError(error)) {
    logger.error({ error, traceId, userId, associationId }, error.message);
    return new UnauthorizedError(error.message);
}
```
to:
```typescript
if (isJwtError(error)) {
    logger.error({ error, traceId, userId, associationId }, error.message);
    return new UnauthorizedError('Invalid or expired token');
}
```

- [ ] **Step 2: Verify the fix compiles**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add src/shared/errors/normalize-unknown-error.ts
git commit -m "fix: sanitize JWT error messages to prevent info leakage"
```

---

### Task 3: Webhook service — guard JSON.parse in processWebhookEvent (H2)

**Problem:** `processWebhookEvent()` calls `JSON.parse(rawBody)` without a try/catch. It currently relies on the webhook route handler to catch it, but if called from another context (test, cron, future code path), an invalid payload throws an unhandled `SyntaxError`.

**Files:**
- Modify: `src/features/payments/services/webhook.service.ts:89`

- [ ] **Step 1: Wrap JSON.parse in try/catch**

Replace lines 89-104:
```typescript
  const payload: RazorpayWebhookPayload = JSON.parse(rawBody);

  let webhookSecret: string | undefined;

  const paymentOrderId = payload.payload.payment?.entity?.order_id;
```
with:
```typescript
  let payload: RazorpayWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    throw new WebhookSignatureError('Invalid JSON payload');
  }

  let webhookSecret: string | undefined;

  const paymentOrderId = payload.payload.payment?.entity?.order_id;
```

- [ ] **Step 2: Verify the fix compiles**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add src/features/payments/services/webhook.service.ts
git commit -m "fix: guard JSON.parse in webhook service against SyntaxError"
```

---

### Task 4: Sign-in route — catch MFA email send failure (M1)

**Problem:** In `sign-in.route.ts`, the MFA verification email is sent via `sendVerificationEmail()` which calls `resend.emails.send()`. If Resend is down or misconfigured, the await throws, returning a 500 at the last step of sign-in — the user can't proceed even though the OTP was generated.

**Files:**
- Modify: `src/features/auth/routes/sign-in.route.ts:139`

- [ ] **Step 1: Read the file to find exact context**

Run: read `src/features/auth/routes/sign-in.route.ts` around line 130-150

- [ ] **Step 2: Wrap email send in try/catch**

Change the email send block from:
```typescript
  if (env.NODE_ENV === 'production') {
    await sendVerificationEmail(user.email, otp, 'LOGIN_MFA');
  }
```
to:
```typescript
  if (env.NODE_ENV === 'production') {
    try {
      await sendVerificationEmail(user.email, otp, 'LOGIN_MFA');
    } catch (error) {
      logger.error({ error, userId: user.id }, 'Failed to send MFA verification email');
    }
  }
```

- [ ] **Step 3: Verify the import for `logger` exists in the file**

Check that `logger` is already imported (likely from `@src/shared/logger`). If not, add the import.

- [ ] **Step 4: Verify the fix compiles**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 5: Commit**

```bash
git add src/features/auth/routes/sign-in.route.ts
git commit -m "fix: catch MFA email send failure without blocking sign-in"
```

---

### Task 5: Forgot-password route — catch email send failure (M2)

**Problem:** Same pattern as Task 4 — password reset email fails with a 500 if Resend is down. The reset token is already stored in DB, so the token is "burned" (one-time use) but the user never received it.

**Files:**
- Modify: `src/features/auth/routes/forgot-password.route.ts:51`

- [ ] **Step 1: Read the file to find exact context**

Run: read `src/features/auth/routes/forgot-password.route.ts` around line 45-60

- [ ] **Step 2: Wrap email send in try/catch**

Change the email send block from:
```typescript
  if (env.NODE_ENV === 'production') {
    await sendPasswordResetEmail(user.email, resetToken);
  }
```
to:
```typescript
  if (env.NODE_ENV === 'production') {
    try {
      await sendPasswordResetEmail(user.email, resetToken);
    } catch (error) {
      logger.error({ error, userId: user.id }, 'Failed to send password reset email');
    }
  }
```

- [ ] **Step 3: Verify the import for `logger` exists in the file**

Check that `logger` is already imported. If not, add the import.

- [ ] **Step 4: Verify the fix compiles**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 5: Commit**

```bash
git add src/features/auth/routes/forgot-password.route.ts
git commit -m "fix: catch password reset email failure without blocking flow"
```

---

### Task 6: EAS webhook service — validate dates before Prisma insert (M3)

**Problem:** `handleBuildEvent` and `handleSubmitEvent` call `new Date(payload.createdAt)` with untrusted data from the EAS external API. An invalid date string creates an `Invalid Date` object which Prisma can't insert into a PostgreSQL `DateTime` column, causing an unhandled error.

**Files:**
- Modify: `src/features/eas/services/webhook.service.ts:230, 262`

- [ ] **Step 1: Read the file to find exact context**

Run: read `src/features/eas/services/webhook.service.ts` around lines 220-270

- [ ] **Step 2: Add date validation before Prisma insert**

For each occurrence of `new Date(payload.createdAt)`, replace:
```typescript
createdAt: new Date(payload.createdAt),
```
with a validated date pattern. Add a small helper function:
```typescript
function validateDate(value: string | undefined | null, field: string): Date {
  const date = new Date(value ?? '');
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date for ${field}: ${value}`);
  }
  return date;
}
```

Then replace each `new Date(payload.createdAt)` with:
```typescript
createdAt: validateDate(payload.createdAt, 'createdAt'),
```

- [ ] **Step 3: Verify the fix compiles**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 4: Commit**

```bash
git add src/features/eas/services/webhook.service.ts
git commit -m "fix: validate EAS webhook dates before Prisma insert"
```

---

### Task 7: Payment services — guard decrypt calls against corrupted ciphertext (M4)

**Problem:** `decrypt()` in `crypto.ts` throws a generic `Error` if the encrypted value format is invalid. This is called from `razorpay.service.ts` and `payment.service.ts` on provider credentials from the DB. A single corrupted DB record causes the entire payment flow for that association to fail with an untyped 500 error.

**Files:**
- Modify: `src/features/payments/services/razorpay.service.ts`
- Modify: `src/features/payments/services/payment.service.ts`

- [ ] **Step 1: Find all decrypt calls in payment services**

Search for `decrypt(` in `src/features/payments/services/`

- [ ] **Step 2: Wrap decrypt calls with try/catch**

For each call to `decrypt()`, wrap with:
```typescript
try {
  keySecret = decrypt(provider.encryptedKeySecret);
} catch (error) {
  throw new PaymentError('Failed to decrypt payment provider credentials');
}
```

- [ ] **Step 3: Verify the fix compiles**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 4: Commit**

```bash
git add src/features/payments/services/
git commit -m "fix: guard decrypt calls in payment services against corrupted DB data"
```

---

### Task 8: Dashboard route — use asyncHandler for consistency (M5)

**Problem:** `src/features/dashboard/routes/index.ts` uses a manual `try/catch` + `next(e)` pattern instead of the `asyncHandler` wrapper used everywhere else. This is inconsistent and could mask future refactoring issues.

**Files:**
- Modify: `src/features/dashboard/routes/index.ts`

- [ ] **Step 1: Read the file**

Run: read `src/features/dashboard/routes/index.ts`

- [ ] **Step 2: Replace manual try/catch with asyncHandler**

Replace:
```typescript
router.get('/overview', auth, async (req, res, next) => {
  try {
    // ...
    return success(res, { data });
  } catch (e) {
    next(e);
  }
});
```
with:
```typescript
router.get('/overview', auth, asyncHandler(async (req, res, next) => {
  // ...
  return success(res, { data });
}));
```

- [ ] **Step 3: Verify the fix compiles**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 4: Commit**

```bash
git add src/features/dashboard/routes/index.ts
git commit -m "refactor: use asyncHandler in dashboard route for consistency"
```

---

### Task 9: Add `unhandledRejection` Node version comment (H4 — documentation only)

**Problem:** The `unhandledRejection` handler in `src/index.ts` may not prevent process exit in Node 15+ since the default behavior changed. Adding a comment documents this for future maintainers.

**Files:**
- Modify: `src/index.ts:130-132`

- [ ] **Step 1: Add explanatory comment**

Change:
```typescript
process.on('unhandledRejection', (reason) => {
  logger.error({ error: reason }, 'Unhandled promise rejection — keeping server alive');
});
```
to:
```typescript
// Note: Node 15+ throws by default on unhandledRejection regardless of this handler.
// This catches rejections in Node <15. For Node 15+, set --unhandled-rejections=warn
// or ensure zero unhandled rejections across the codebase.
process.on('unhandledRejection', (reason) => {
  logger.error({ error: reason }, 'Unhandled promise rejection — keeping server alive');
});
```

- [ ] **Step 2: Commit**

```bash
git add src/index.ts
git commit -m "docs: add note about unhandledRejection in Node 15+"
```
