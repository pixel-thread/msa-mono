# Theme Provider Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a persistent global Theme Provider using Zustand, SecureStore, and NativeWind's color scheme controls.

**Architecture:** A Zustand store persists the user's explicit preference (`'light'`, `'dark'`, or `'system'`) securely using `expo-secure-store`. A ThemeProvider component reads this preference, falls back to React Native's system detection if set to `'system'`, and imperatively updates NativeWind's scheme via `colorScheme.set()`.

**Tech Stack:** React Native, Expo, Zustand, expo-secure-store, NativeWind.

---

### Task 1: Create Zustand Store for Theme Preference

**Files:**
- Create: `src/shared/store/theme.store.ts`
- Create: `src/shared/store/__tests__/theme.store.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/shared/store/__tests__/theme.store.test.ts
import { useThemeStore } from '../theme.store';

describe('useThemeStore', () => {
  beforeEach(() => {
    useThemeStore.setState({ themePreference: 'system' });
  });

  it('should initialize with system preference', () => {
    const { themePreference } = useThemeStore.getState();
    expect(themePreference).toBe('system');
  });

  it('should update theme preference', () => {
    useThemeStore.getState().setThemePreference('dark');
    expect(useThemeStore.getState().themePreference).toBe('dark');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/shared/store/__tests__/theme.store.test.ts`
Expected: FAIL because `theme.store.ts` does not exist.

- [ ] **Step 3: Write minimal implementation**

```typescript
// src/shared/store/theme.store.ts
import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeState {
  themePreference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => void;
}

// Custom storage engine using expo-secure-store
const secureStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(name);
    }
    return await SecureStore.getItemAsync(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.setItem(name, value);
    } else {
      await SecureStore.setItemAsync(name, value);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(name);
    } else {
      await SecureStore.deleteItemAsync(name);
    }
  },
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themePreference: 'system',
      setThemePreference: (preference) => set({ themePreference: preference }),
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => secureStorage),
    }
  )
);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/shared/store/__tests__/theme.store.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/shared/store/theme.store.ts src/shared/store/__tests__/theme.store.test.ts
git commit -m "feat: add zustand theme store with secure persistence"
```

---

### Task 2: Create Theme Provider Component

**Files:**
- Create: `src/shared/components/providers/theme.provider.tsx`
- Create: `src/shared/components/providers/__tests__/theme.provider.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/shared/components/providers/__tests__/theme.provider.test.tsx
import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '../theme.provider';
import { useThemeStore } from '../../../store/theme.store';
import { useColorScheme as useTailwindColorScheme } from 'nativewind';

// Mock the store and nativewind
jest.mock('../../../store/theme.store', () => ({
  useThemeStore: jest.fn(),
}));

jest.mock('nativewind', () => ({
  useColorScheme: jest.fn(),
}));

jest.mock('react-native', () => {
  const rn = jest.requireActual('react-native');
  return {
    ...rn,
    useColorScheme: jest.fn(),
  };
});

import { useColorScheme as useRNColorScheme } from 'react-native';

describe('ThemeProvider', () => {
  const mockSetColorScheme = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useTailwindColorScheme as jest.Mock).mockReturnValue({ setColorScheme: mockSetColorScheme });
  });

  it('renders children correctly', () => {
    (useThemeStore as unknown as jest.Mock).mockReturnValue('system');
    (useRNColorScheme as jest.Mock).mockReturnValue('light');

    const { getByText } = render(
      <ThemeProvider>
        <Text>Test Child</Text>
      </ThemeProvider>
    );

    expect(getByText('Test Child')).toBeTruthy();
    expect(mockSetColorScheme).toHaveBeenCalledWith('light');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/shared/components/providers/__tests__/theme.provider.test.tsx`
Expected: FAIL because `theme.provider.tsx` does not exist.

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/shared/components/providers/theme.provider.tsx
import React, { useEffect } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { useColorScheme as useTailwindColorScheme } from 'nativewind';
import { useThemeStore } from '../../store/theme.store';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const themePreference = useThemeStore((state) => state.themePreference);
  const systemTheme = useRNColorScheme();
  const { setColorScheme } = useTailwindColorScheme();

  useEffect(() => {
    let activeTheme: 'light' | 'dark' = 'light'; // Fallback

    if (themePreference === 'system') {
      activeTheme = systemTheme === 'dark' ? 'dark' : 'light';
    } else {
      activeTheme = themePreference;
    }

    setColorScheme(activeTheme);
  }, [themePreference, systemTheme, setColorScheme]);

  return <>{children}</>;
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/shared/components/providers/__tests__/theme.provider.test.tsx`
Expected: PASS (or fail gracefully if nativewind/testing-library mocks have issues, resolve as needed but logic should be sound).

- [ ] **Step 5: Commit**

```bash
git add src/shared/components/providers/theme.provider.tsx src/shared/components/providers/__tests__/theme.provider.test.tsx
git commit -m "feat: add theme provider component"
```

---

### Task 3: Integrate Theme Provider into App

**Files:**
- Modify: `src/shared/components/providers/index.tsx`

- [ ] **Step 1: Write the failing test**
*(Since this is a simple wrapper modification in an existing file, we will directly implement and verify via build).*

- [ ] **Step 2: Write minimal implementation**

Modify `src/shared/components/providers/index.tsx` to include `ThemeProvider`.

```tsx
// src/shared/components/providers/index.tsx
import { Stack } from 'expo-router';
import { AuthProvider } from './auth';
import React from 'react';
import { AuthGuard } from '../auth';
import { NotificationProvider } from './notifications';
import { ThemeProvider } from './theme.provider';

export * from './auth';
export * from './notifications';
export * from './theme.provider'; // Also export it so it can be used elsewhere if needed

export const AppProviders = () => {
  return (
    <React.Fragment>
      <ThemeProvider>
        <AuthProvider>
          <AuthGuard>
            <NotificationProvider>
              <Stack screenOptions={{ headerShown: false }} />
            </NotificationProvider>
          </AuthGuard>
        </AuthProvider>
      </ThemeProvider>
    </React.Fragment>
  );
};
```

- [ ] **Step 3: Run the build to verify no errors**

Run: `npx tsc --noEmit`
Expected: PASS (No type errors).

- [ ] **Step 4: Commit**

```bash
git add src/shared/components/providers/index.tsx
git commit -m "feat: integrate theme provider into global app providers"
```
