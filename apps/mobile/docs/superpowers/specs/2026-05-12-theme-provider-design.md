# Theme Provider Design Specification

**Date:** 2026-05-12
**Topic:** Theme Provider Implementation
**Status:** Approved

## Architecture & Data Flow

We will implement a global Theme Provider to manage the application's color scheme. The solution decouples the theme preference state from the UI presentation logic by utilizing a Zustand store for persistence and React Native's native hooks for system detection.

### 1. State Management (Zustand + Secure Store)
- **Store Location:** `src/shared/store/theme.store.ts`
- **State Structure:** 
  - `themePreference`: `'light' | 'dark' | 'system'` (Default: `'system'`)
  - `setThemePreference`: `(preference: 'light' | 'dark' | 'system') => void`
- **Persistence:** 
  - The Zustand store will use the `persist` middleware.
  - We will implement a custom storage engine using `expo-secure-store` to ensure the preference is persisted securely across app restarts.

### 2. Theme Provider Component
- **Component Location:** `src/shared/components/providers/theme.provider.tsx`
- **Logic:**
  1. Read the `themePreference` from the Zustand store.
  2. Read the system color scheme using `useColorScheme()` from `react-native`.
  3. Compute the `activeTheme`: 
     - If `themePreference` is `'system'`, use the value from React Native's `useColorScheme()` (defaults to `'light'` if undetected).
     - Otherwise, use the explicit `themePreference`.
  4. Imperatively update NativeWind using `colorScheme.set(activeTheme)` from the `nativewind` package whenever the `activeTheme` changes.
- **Rendering:** Renders its `children`.

### 3. Integration
- Add the `ThemeProvider` to the global provider stack in `src/shared/components/providers/index.tsx`.
- Wrap the existing application stack inside the `ThemeProvider` to ensure all components receive the correctly configured NativeWind classes.

## Error Handling & Edge Cases
- SecureStore has a size limit and can fail on certain devices. The Zustand persist middleware handles missing/failing stores gracefully, falling back to the initial state (`'system'`).

## Testing Strategy
- Unit tests can be written for the Zustand store to ensure `setThemePreference` correctly updates the state.
- Integration test for the `ThemeProvider` to ensure `colorScheme.set` is called with the correct value based on both the Zustand store value and the mocked React Native system theme.
