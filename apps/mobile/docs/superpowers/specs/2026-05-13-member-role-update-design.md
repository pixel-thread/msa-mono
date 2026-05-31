# Member Role Update Feature Design

## Purpose
Allow high-role users (Super Admin, President, Secretary) to add new roles to an existing member or remove existing ones. The updates will be performed via a "Manage Roles" modal accessible from the Member Details screen.

## UI/UX
- **Visibility**: A "Manage Roles" button will be rendered on the `MemberDetailScreen` only if the current user has `HIGH_ROLE_ACCESS`.
- **Placement**: A new button "Manage Roles" placed below the member's quick info grid or next to the status badges.
- **Interactions**:
  - Tapping "Manage Roles" opens a Modal/Dialog.
  - The modal displays the user's current roles as chips. Each chip has a "remove" icon.
  - Tapping a role chip's remove icon will prompt a confirmation to delete the role.
  - The UI will also present a list (or dropdown) of available roles that the member *does not* currently have.
  - Selecting a new role and confirming will show a loading state and add the role.
  - Upon success of either adding or removing a role, the modal will update and the member details will reflect the changes.

## Technical Architecture
- **Hooks**: 
  - Create a new mutation hook `useAddMemberRole` in `src/features/members/hooks/use-add-member-role.ts`.
  - Create a new mutation hook `useRemoveMemberRole` in `src/features/members/hooks/use-remove-member-role.ts`.
- **API Constant**: Add the role update endpoint to `src/features/members/utils/constants/endpoints.ts` (e.g. `manageRole: (id: string) => '/members/' + id + '/role'`).
- **Endpoint Calls**: 
  - To Add: Call `PATCH /members/:id/role` with payload `{ role: string }`.
  - To Remove: Call `PUT /members/:id/role` with payload `{ role: string }`.
- **Cache Invalidation**: On success, the hooks must invalidate the `MemberQueryKeys.detail(id)` and `MemberQueryKeys.all()` to ensure the UI updates immediately.
- **Role Verification**: Utilize `useAuthStore` to get the current user's role and `hasHighRoleAccess` from `src/features/meetings/utils/permission.ts` to determine visibility.

## Components
- Create a `ManageRolesModal` component that receives the `memberId` and the `currentRoles`. 
- Use the existing `Modal` or `Dialog` UI components from `src/shared/components/ui` if available, or a standard React Native `Modal`.

## Error Handling
- Failed mutations will display a toast/alert with the error message.
- The submit/remove actions within the modal will remain disabled during the loading state to prevent duplicate submissions.
