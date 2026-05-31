# Design Doc: Custom Drawer Content Shell

**Version:** 1.0.0
**Status:** DRAFT
**Created:** 2026-05-12

## Purpose
Implement a custom drawer content for the side navigation menu. This replaces the default drawer content with a branded header, grouped navigation items, and a footer with logout functionality.

## Architecture
- **Component:** `CustomDrawerContent`
- **Navigation:** `expo-router/drawer`
- **State Management:** `useAuthStore` (Zustand) for user info and logout.
- **Route Detection:** `useSegments` from `expo-router` to highlight the active menu item.

## UI Components
- **Container:** `SafeAreaView` for proper padding on notched devices.
- **Header:** Branded text section.
- **Menu Items:** `DrawerItem` component (previously created) with grouped labels.
- **Footer:** Links to legal docs and a destructive logout button.

## Data Flow
1. `useSegments` retrieves the current navigation path.
2. `currentRoute` is derived from the last segment.
3. `DrawerItem` components receive `focused` prop based on `currentRoute` matching their target.
4. `logout` action from `useAuthStore` is triggered on Logout button press.

## Tech Stack
- React Native / Expo
- Tailwind CSS (NativeWind)
- Lucide/Ionicons (via `Ionicons` in `DrawerItem`)
- Zustand (Auth Store)

## Out of Scope
- Actual implementation of Terms & Conditions and Privacy Policy screens (placeholders for now).
- User avatar or detailed profile info in the header (keeping it simple as per shell requirement).
