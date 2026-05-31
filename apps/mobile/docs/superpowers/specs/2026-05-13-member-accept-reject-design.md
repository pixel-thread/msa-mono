# Member Accept/Reject Feature Design

## Purpose

Allow high-role users (Super Admin, President, Secretary) to review `INACTIVE` members and either Accept (`ACTIVE`) or Reject (`SUSPENDED`) them directly from the Member Details screen.

## UI/UX

- **Visibility**: The Accept and Reject buttons will only be rendered on the `MemberDetailScreen` if:
  1. The current user has `HIGH_ROLE_ACCESS`.
  2. The viewed member's status is `INACTIVE`.
- **Placement**: Inline Buttons placed prominently below the Hero Information section (name, email, role badges).
- **Interactions**:
  - Tapping "Accept" shows a confirmation alert: "Are you sure you want to approve this member?"
  - Tapping "Reject" shows a confirmation alert: "Are you sure you want to reject and suspend this member?"
  - Both buttons will show a loading state during the API call.

## Technical Architecture

- **Hook**: Create a new mutation hook `useUpdateMemberStatus` in `src/features/members/hooks/use-update-member-status.ts`.
- **API Constant**: Add the status update endpoint to `src/features/members/utils/constants/endpoints.ts` (e.g. `updateStatus: (id: string) => '/members/' + id + '/status'`).
- **Endpoint Call**: It will call `PATCH /members/:id/status` via the configured `http` client. Payload: `{ status: UserStatus,userId:string }`.
- **Cache Invalidation**: On success, the hook must invalidate the `MemberQueryKeys.detail(id)` and `MemberQueryKeys.lists()` to ensure the UI updates immediately.
- **Role Verification**: Utilize `useAuthStore` to get the current user's role and `hasHighRoleAccess` from `src/features/meetings/utils/permission.ts` to determine visibility.

## Error Handling

- Failed mutations will display a toast/alert with the error message.
- The buttons will remain disabled during the loading state to prevent duplicate submissions.
