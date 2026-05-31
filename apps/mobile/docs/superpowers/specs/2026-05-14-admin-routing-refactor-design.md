# Design: DSAR and Member Screens Refactor to Admin Group

**Date:** 2026-05-14
**Status:** DRAFT

## 1. Problem Statement
The current routing structure has administrative screens (DSAR Management and Member Management) scattered or in the root of the `(protected)` directory. To maintain a clean and logical routing hierarchy, these screens should be grouped under a dedicated `admin` route group.

## 2. Proposed Changes

### 2.1 Directory Structure Refactor
- Move member-related screens from `src/app/(protected)/members` to `src/app/(protected)/admin/members`.
- Ensure DSAR-related screens remain or are correctly placed in `src/app/(protected)/admin/dsar`.
- The `src/app/(protected)/members` directory will be removed.

### 2.2 Navigation and Route Updates
- All navigation references pointing to `/(protected)/members` must be updated to `/(protected)/admin/members`.
- All navigation references pointing to `/(protected)/members/[id]` must be updated to `/(protected)/admin/members/[id]`.
- All navigation references pointing to `/(protected)/admin/dsar` must be updated to the new structure if applicable (though they seem to be in `admin/dsar` already).

### 2.3 Files to be Moved/Created
- `src/app/(protected)/members/index.tsx` -> `src/app/(protected)/admin/members/index.tsx`
- `src/app/(protected)/members/[id]/index.tsx` -> `src/app/(protected)/admin/members/[id]/index.tsx`
- `src/app/(protected)/members/_layout.tsx` -> `src/app/(protected)/admin/members/_layout.tsx`

### 2.4 Navigation References to Update
- `src/features/dashboard/screens/dashboard.screen.tsx`: Update `router.push('/(protected)/members')` to `router.push('/(protected)/admin/members')`.
- `src/features/members/components/member-card.component.tsx`: Update `router.push('/members/${member.id}')` to `router.push('/(protected)/admin/members/${member.id}')`.
- `src/shared/components/common/drawer-content.tsx`: Update navigation for "Members" and "DSAR Management".

## 3. Data Flow and Invariants
- No changes to data flow or components logic.
- The refactor is strictly a file-system routing change.

## 4. Testing Strategy
- Manual verification of navigation from Dashboard, Drawer, and Member Cards.
- Ensure all deep links to member details are still functional with the new path.
- Check that the `_layout.tsx` in `admin/members` correctly wraps the screens with the `Container` and `Stack`.

## 5. Security Considerations
- The screens remain within the `(protected)` directory, ensuring they are only accessible to authenticated users.
- Role-based access (isAdmin check in the drawer) still controls visibility of navigation items.
