# Design Document: Admin Page and Feature Removal

**Date:** 2026-05-20
**Status:** DRAFT
**Topic:** Admin Removal

## 1. Purpose
The administrative interface for this application will be managed exclusively via the web platform. This design outlines the safe and complete removal of all admin-related pages, features, and navigation entry points from the mobile application.

## 2. Scope of Changes

### 2.1 Directory & File Deletions
- **Routes:**
    - `src/app/(protected)/admin/` (Full directory)
- **Strictly Admin Features:**
    - `src/features/members/` (Full directory)
    - `src/features/payment/` (Full directory)
- **Admin Screens in Shared Features:**
    - `src/features/dsar/screens/AdminDSARDashboardScreen.tsx`
    - `src/features/dsar/screens/AdminDSARDetailScreen.tsx`
    - `src/features/training/screens/admin-record-completion.screen.tsx`
    - `src/features/training/screens/admin-training-assign.screen.tsx`
    - `src/features/training/screens/admin-training-completions.screen.tsx`
    - `src/features/training/screens/admin-training-detail.screen.tsx`
    - `src/features/training/screens/admin-training-form.screen.tsx`
    - `src/features/training/screens/admin-training-list.screen.tsx`
- **Security & Guards:**
    - `src/shared/components/auth/admin-auth-guard.tsx`

### 2.2 UI & Navigation Modifications
- **Drawer (`src/shared/components/common/drawer-content.tsx`):**
    - Remove `isAdmin` constant.
    - Remove the entire "Administrative" `menuGroups` section.
    - Remove `canManageTraining` check and logic.
- **Dashboard (`src/features/dashboard/screens/dashboard.screen.tsx`):**
    - Remove the "members" `QuickAction` card.
- **Meeting Minutes (`src/features/meetings/screens/meeting-minutes.screen.tsx`):**
    - Remove `isAdmin` check.
    - Remove `rightAction` in `StackHeader` (the "Add" button).
    - Remove `onEdit` and `onDelete` props from `MinuteCard`.
    - Remove the "Add First Minute" button from `ListEmptyComponent`.
- **Meeting Minute Card (`src/features/meetings/components/meeting-minute-card.tsx`):**
    - Remove `isAdmin` prop and associated conditional rendering for edit/delete buttons.

### 2.3 Feature Index Updates
- **`src/features/dsar/index.ts`**: Remove exports for deleted admin screens.
- **`src/features/training/index.ts`**: Remove exports for deleted admin screens.
- **`src/features/members/index.ts`**: (File deleted with directory)
- **`src/features/payment/index.ts`**: (File deleted with directory)

## 3. Technical Strategy
1. **Research & Backup:** (Completed)
2. **Sequential Deletion:** Delete files in order of their dependency depth to minimize temporary build errors.
3. **Refactoring Shared Components:** Modify drawer, dashboard, and meeting screens to remove admin-specific conditional logic.
4. **Validation:**
    - Ensure `npm run lint` passes.
    - Ensure `tsc` (TypeScript check) passes.
    - Verify app starts and runs without crashes.

## 4. Constraints & Risks
- **Shared Utilities:** Ensure `hasHighRoleAccess` is either removed or maintained if required for non-admin visibility logic (though currently it seems strictly for admin actions).
- **Navigation:** Deep links to admin routes will now fail (Expo Router will handle this via its default 404/Home behavior).

## 5. Success Criteria
- No "admin" or "members" related links visible in the app.
- All files listed in Section 2.1 are removed from the filesystem.
- Application builds and navigates correctly.
