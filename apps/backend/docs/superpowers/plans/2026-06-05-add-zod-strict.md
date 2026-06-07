# Add Zod `.strict()` to All Schemas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `.strict()` to every Zod object schema that currently lacks it, rejecting unknown fields at the API boundary as required by the project's security rules.

**Architecture:** All changes are single-line additions — appending `.strict()` to existing `z.object({...})` calls in validator files and inline route schemas. No logic changes, no type changes, no behavior changes (other than rejection of unexpected input fields).

**Tech Stack:** Zod (runtime validation), Express `validate()` middleware consumes these schemas.

---

### Task 1: Meetings feature — `meetings.ts` validators

**Files:**

- Modify: `src/features/meetings/validators/meetings.ts` — 4 schemas

**Changes:**

- Line 6: `agendaItemSchema` — add `.strict()` after `z.object({...})`
- Line 20: `CreateMeetingSchema` — add `.strict()` after `z.object({...})`
- Line 32: `UpdateMeetingSchema` — add `.strict()` after `z.object({...})`
- Line 47: `MeetingQuerySchema` — add `.strict()` after `z.object({...})`

Each change is the same pattern — append `.strict()` to the `z.object(...)` call:

```ts
// Before (line 20):
export const CreateMeetingSchema = z.object({

// After:
export const CreateMeetingSchema = z.object({
```

becomes:

```ts
// Before (line 20):
export const CreateMeetingSchema = z.object({

// After:
export const CreateMeetingSchema = z.object({
```

Wait — `.strict()` is a method call on the object schema, so it must go _after_ the closing `)` of `z.object({...})`:

```ts
// Before:
export const CreateMeetingSchema = z.object({
  title: z.string({ message: 'Title is required' }).min(3, 'Title must be at least 3 characters'),
  type: z.enum(MeetingType, { message: 'Meeting type is required' }),
  scheduledAt: z.coerce.date({ message: 'Scheduled date is required' }),
  venue: z
    .string({ message: 'Venue must be a string' })
    .max(500, 'Venue cannot exceed 500 characters')
    .optional(),
  agendaItems: z.array(agendaItemSchema).min(1, 'At least one agenda item is required'),
});

// After:
export const CreateMeetingSchema = z
  .object({
    title: z.string({ message: 'Title is required' }).min(3, 'Title must be at least 3 characters'),
    type: z.enum(MeetingType, { message: 'Meeting type is required' }),
    scheduledAt: z.coerce.date({ message: 'Scheduled date is required' }),
    venue: z
      .string({ message: 'Venue must be a string' })
      .max(500, 'Venue cannot exceed 500 characters')
      .optional(),
    agendaItems: z.array(agendaItemSchema).min(1, 'At least one agenda item is required'),
  })
  .strict();
```

Apply to all 4 schemas (`agendaItemSchema`, `CreateMeetingSchema`, `UpdateMeetingSchema`, `MeetingQuerySchema`).

**Verification:**

- Run: `npx tsc --noEmit` — confirms no type breakage
- Or: `npx jest --testPathPattern meetings` — existing tests pass

---

### Task 2: Meetings feature — `agenda-items.ts` validators

**Files:**

- Modify: `src/features/meetings/validators/agenda-items.ts` — 3 main schemas + 4 discriminated union variants

**Changes:**

Line 4: `CreateAgendaItemSchema` — add `.strict()`:

```ts
export const CreateAgendaItemSchema = z
  .object({
    order: z
      .number({ message: 'Order must be a number' })
      .int({ message: 'Order must be an integer' })
      .positive({ message: 'Order must be a positive number' }),
    title: z.string({ message: 'Title is required' }).min(1, 'Agenda item title is required'),
    description: z
      .string({ message: 'Description must be a string' })
      .max(1000, 'Description cannot exceed 1000 characters')
      .optional(),
  })
  .strict();
```

Line 25: `AgendaOperationSchema` — add `.strict()` to the outer schema AND to each discriminated union variant:

```ts
export const AgendaOperationSchema = z
  .object({
    operations: z.array(
      z.discriminatedUnion('type', [
        z
          .object({
            type: z.literal('CREATE'),
            data: CreateAgendaItemSchema,
          })
          .strict(),
        z
          .object({
            type: z.literal('UPDATE'),
            id: z.uuid('Invalid ID format'),
            data: UpdateAgendaItemSchema,
          })
          .strict(),
        z
          .object({
            type: z.literal('DELETE'),
            id: z.uuid('Invalid ID format'),
          })
          .strict(),
        z
          .object({
            type: z.literal('REORDER'),
            mappings: z.array(
              z
                .object({
                  id: z.uuid('Invalid ID format'),
                  order: z.number().int().positive(),
                })
                .strict(),
            ),
          })
          .strict(),
      ]),
    ),
  })
  .strict();
```

Line 57: `ProcessingAgendaParamsSchema` — add `.strict()`:

```ts
export const ProcessingAgendaParamsSchema = z
  .object({ meetingId: z.string('Invalid meeting ID') })
  .strict();
```

Note: `UpdateAgendaItemSchema` (line 20) uses `CreateAgendaItemSchema.partial()` — `.partial()` preserves `.strict()`, so no separate change needed.

**Verification:**

- Run: `npx tsc --noEmit`

---

### Task 3: Meetings feature — `attendee.ts` validators

**Files:**

- Modify: `src/features/meetings/validators/attendee.ts` — 3 schemas

**Changes:**

Line 5: `AssignAttendeeSchema`:

```ts
export const AssignAttendeeSchema = z
  .object({
    userId: z.string('Invalid user ID format'),
    attendeeRole: z
      .enum(AttendeeRole, { message: 'Invalid attendee role' })
      .default(AttendeeRole.OPTIONAL),
  })
  .strict();
```

Line 13: `BulkAssignAttendeesSchema`:

```ts
export const BulkAssignAttendeesSchema = z
  .object({
    userIds: z
      .array(z.uuid('Invalid user ID format'), {
        message: 'User IDs must be an array of valid UUIDs',
      })
      .min(1, 'At least one user ID is required')
      .max(200, 'Cannot assign more than 200 users at once'),
    attendeeRole: z
      .enum(AttendeeRole, { message: 'Invalid attendee role' })
      .default(AttendeeRole.OPTIONAL),
  })
  .strict();
```

Line 26: `UpdateAttendeeSchema`:

```ts
export const UpdateAttendeeSchema = z
  .object({
    userId: z.uuid().optional(),
    attendeeRole: z.enum(AttendeeRole, { message: 'Invalid attendee role' }).optional(),
    rsvpStatus: z.enum(RsvpStatus, { message: 'Invalid RSVP status' }).optional(),
    rsvpNote: z
      .string({ message: 'RSVP note must be a string' })
      .max(500, 'RSVP note cannot exceed 500 characters')
      .optional(),
  })
  .strict();
```

**Verification:**

- Run: `npx tsc --noEmit`

---

### Task 4: Meetings feature — `minutes.ts` validators

**Files:**

- Modify: `src/features/meetings/validators/minutes.ts` — 1 base schema

**Changes:**

Line 4: `CreateMeetingMinuteSchema`:

```ts
export const CreateMeetingMinuteSchema = z
  .object({
    agendaPoint: z.string().min(1, 'Agenda point is required'),
    decision: z.string().min(1, 'Decision is required'),
    actionItems: z
      .array(
        z
          .object({
            assigneeId: z.uuid('Invalid assignee ID').optional(),
            task: z.string().min(1, 'Task description is required'),
            dueDate: z.coerce.date('Invalid date format').optional(),
          })
          .strict(),
      )
      .optional(),
  })
  .strict();
```

Note: `UpdateMeetingMinuteSchema` (line 22) uses `CreateMeetingMinuteSchema.partial()` — covered by the base schema change.

**Verification:**

- Run: `npx tsc --noEmit`

---

### Task 5: DSAR feature — `validators/index.ts`

**Files:**

- Modify: `src/features/dsar/validators/index.ts` — 3 schemas

**Changes:**

Line 22: `SubmitDsarSchema`:

```ts
export const SubmitDsarSchema = z
  .object({
    requestType: z.enum(DsarRequestType),
    requestedData: z.array(z.string()).min(1, 'At least one data category required'),
    description: z
      .string()
      .max(500)
      .optional()
      .transform((v) => v?.trim()),
  })
  .strict();
```

Line 37: `RespondDsarSchema`:

```ts
export const RespondDsarSchema = z
  .object({
    status: z.enum(DsarStatus),
    notes: z.string().max(1000).optional(),
    rejectedReason: z.string().max(500).optional(),
    responseType: z.string().optional(),
    storageKey: z.string().optional(),
    deliveryMethod: z.string().default('secure_download'),
  })
  .strict();
```

Line 51: `DsarQuerySchema`:

```ts
export const DsarQuerySchema = z
  .object({
    page: pageNumberValidation,
    status: z.enum(DsarStatus).optional(),
    requestType: z.enum(DsarRequestType).optional(),
    userId: z.string().optional(),
  })
  .strict();
```

**Verification:**

- Run: `npx tsc --noEmit`

---

### Task 6: Members feature — inline route schemas (8 files)

**Files:** (Modify all)

- `src/features/members/routes/list-members.route.ts`
- `src/features/members/routes/get-member.route.ts`
- `src/features/members/routes/update-member.route.ts`
- `src/features/members/routes/change-role.route.ts`
- `src/features/members/routes/update-status.route.ts`
- `src/features/members/routes/suspend.route.ts`
- `src/features/members/routes/delete-member.route.ts`
- `src/features/members/routes/onboarding.route.ts`

**Changes — add `.strict()` after each `z.object({...})`:**

1. `list-members.route.ts` line 34 (`QuerySchema`):

```ts
const QuerySchema = z
  .object({
    page: pageNumberValidation,
    status: z.enum(UserStatus).optional(),
    search: z.string().optional(),
  })
  .strict();
```

2. `get-member.route.ts` line 32 (`ParamSchema`):

```ts
const ParamSchema = z.object({ memberId: z.uuid() }).strict();
```

3. `update-member.route.ts` line 34 (`ParamSchema`):

```ts
const ParamSchema = z.object({ memberId: z.uuid() }).strict();
```

Line 37 (`AdminOnboardingSchema`):

```ts
const AdminOnboardingSchema = z
  .object({
    name: z.string().min(1, 'Name is required').optional(),
    mobile: z
      .string()
      .min(10, 'Mobile must be 10 digits')
      .max(10, 'Mobile must be 10 digits')
      .regex(/^[0-9]+$/, 'Mobile should contain only numbers')
      .optional(),
    designation: z.string().optional(),
    dateOfJoiningGovt: z.coerce.date().optional(),
    dateOfJoiningAssociation: z.coerce.date().optional(),
    membershipNumber: z.string().optional(),
    associationId: z.uuid(),
  })
  .strict();
```

4. `change-role.route.ts` line 40 (`UpdateUserRoleSchema`):

```ts
const UpdateUserRoleSchema = z
  .object({
    role: z.nativeEnum(UserRole),
  })
  .strict();
```

Line 45 (`UpdateUserRoleParamsSchema`):

```ts
const UpdateUserRoleParamsSchema = z
  .object({
    memberId: z.uuid(),
  })
  .strict();
```

5. `update-status.route.ts` line 35 (`UpdateUserStatusSchema`):

```ts
const UpdateUserStatusSchema = z
  .object({
    status: z.nativeEnum(UserStatus),
  })
  .strict();
```

Line 40 (`UpdateUserStatusParamsSchema`):

```ts
const UpdateUserStatusParamsSchema = z
  .object({
    memberId: z.uuid(),
  })
  .strict();
```

6. `suspend.route.ts` line 38 (`SuspenseUserRouteParams`):

```ts
const SuspenseUserRouteParams = z
  .object({
    memberId: z.uuid(),
  })
  .strict();
```

7. `delete-member.route.ts` line 37 (`ParamSchema`):

```ts
const ParamSchema = z.object({ memberId: z.uuid() }).strict();
```

8. `onboarding.route.ts` line 26 (`OnboardingSchema`):

```ts
const OnboardingSchema = z
  .object({
    dateOfJoiningGovt: z
      .string()
      .datetime()
      .refine((d) => new Date(d) < new Date(), 'Cannot be in the future'),
    dateOfJoiningAssociation: z
      .string()
      .datetime()
      .refine((d) => new Date(d) < new Date(), 'Cannot be in the future'),
    mobile: z.string().regex(/^[6-9]\d{9}$/, 'Valid Indian mobile number required'),
    designation: z.string().min(2).max(100).trim(),
  })
  .strict();
```

**Verification:**

- Run: `npx tsc --noEmit`

---

### Task 7: Verify full build

- [ ] **Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no new type errors.

- [ ] **Run tests**

```bash
npx jest --passWithNoTests
```

Expected: all existing tests pass (no behavior change).

- [ ] **Commit**

```bash
git add src/features/meetings/validators/ src/features/dsar/validators/ src/features/members/routes/
git commit -m "fix(validation): add .strict() to all Zod schemas to reject unknown fields"
```
