# Design Spec: Meeting Minutes Implementation

**Date:** 2026-05-12
**Status:** DRAFT
**Feature:** Meeting Minutes (Add, Update, Delete, View)
**Roles:** SUPER_ADMIN, PRESIDENT, SECRETARY (High Roles)

## 1. Overview

Implement a dedicated Meeting Minutes screen accessible from the Meeting Detail page. This screen will allow all members to view minutes, while high-role users (Super Admin, President, Secretary) can manage (Add/Update/Delete) them.

## 2. Role & Permission Updates

- **Type Updates:**
  - `src/shared/types/role.ts`: Add `PRESIDENT` and `SECRETARY` to `UserRole`.
  - `src/features/auth/types/auth.types.ts`: Add `PRESIDENT` and `SECRETARY` to `UserRole`.
- **Utility:**
  - Create `src/features/meetings/utils/permission.ts`:
    ```typescript
    import { UserRole } from '@src/features/auth';
    export const HIGH_ROLE_USERS: UserRole[] = ['SUPER_ADMIN', 'PRESIDENT', 'SECRETARY'];
    export const hasHighRoleAccess = (role: UserRole): boolean => HIGH_ROLE_USERS.includes(role);
    ```

## 3. Navigation & Routing

- **File Structure:**
  - Rename `src/app/(protected)/meetings/[id].tsx` -> `src/app/(protected)/meetings/[id]/index.tsx`.
  - Create `src/app/(protected)/meetings/[id]/minutes/index.tsx`.
- **Entry Point:**
  - Add a "Meeting Minutes" button in the `MeetingDetailScreen`.

## 4. Meeting Minutes Screen

- **Components:**
  - `MinutesList`: Renders a list of minutes using `useMeetingMinuite`.
  - `MinuteCard`: Displays `agendaPoint`, `decision`, and nested `actionItems`.
  - `MinuteFormModal`: A modal containing a form for adding/editing minutes using `CreateMeetingMinuteSchema`.
- **Admin Actions:**
  - "Add Minute" button (Header or FAB).
  - "Edit" and "Delete" icons on each `MinuteCard`.

## 5. Data Layer

- **Hooks:**
  - Use existing: `useMeetingMinuite`, `useCreateMeetingMinuite`, `useUpdateMeetingMinuite`.
  - Create new: `useDeleteMeetingMinute` for `DELETE /meeting/${meetingId}/minuite/${minuteId}`.
- **Validation:** Use `CreateMeetingMinuteSchema` and `UpdateMeetingMinuteSchema` from `src/features/meetings/validators/minuites.ts`.

## 6. Implementation Plan Highlights

1. Update roles and create permission utility.
2. Re-structure meeting detail routes.
3. Add "Minutes" button to detail screen.
4. Implement `useDeleteMeetingMinute` hook.
5. Build the Minutes screen with list and management controls.
6. Verify role-based visibility of management buttons.
