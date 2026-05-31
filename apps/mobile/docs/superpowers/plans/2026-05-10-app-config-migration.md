# app.config.ts Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the project's static `app.json` to a dynamic `app.config.ts` that supports auto-suffixing for different environments.

**Architecture:** Use `process.env.APP_VARIANT` to conditionally set the app name, bundle identifier (iOS), and package name (Android).

**Tech Stack:** Expo 54, TypeScript, Node.js.

---

### Task 1: Create `app.config.ts`

**Files:**
- Create: `app.config.ts`

- [ ] **Step 1: Write the implementation**

```typescript
import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const variant = process.env.APP_VARIANT || 'production';

  const getName = () => {
    if (variant === 'development') return 'msa (Dev)';
    if (variant === 'preview') return 'msa (Preview)';
    return 'msa';
  };

  const getIdentifier = () => {
    if (variant === 'development') return 'com.pixelthread.msa.dev';
    if (variant === 'preview') return 'com.pixelthread.msa.preview';
    return 'com.pixelthread.msa';
  };

  return {
    ...config,
    name: getName(),
    slug: 'msa',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './src/shared/assets/icon.png',
    userInterfaceStyle: 'automatic',
    scheme: 'msa',
    platforms: ['ios', 'android'],
    splash: {
      image: './src/shared/assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: getIdentifier(),
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './src/shared/assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      package: getIdentifier(),
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './src/shared/assets/favicon.png',
    },
    plugins: ['expo-router', 'expo-notifications'],
    experiments: {
      typedRoutes: true,
      tsconfigPaths: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: '76bf6558-f870-4eb0-b4a2-698184fefb41',
      },
    },
    owner: 'pixel-thread',
  };
};
```

- [ ] **Step 2: Commit**

```bash
git add app.config.ts
git commit -m "feat: add dynamic app.config.ts"
```

---

### Task 2: Verify Development Configuration

- [ ] **Step 1: Run the verification command**

Run: `APP_VARIANT=development npx expo config --type public`

- [ ] **Step 2: Check output**

Expected:
- `name` should be `"msa (Dev)"`
- `ios.bundleIdentifier` should be `"com.pixelthread.msa.dev"`
- `android.package` should be `"com.pixelthread.msa.dev"`

---

### Task 3: Verify Preview Configuration

- [ ] **Step 1: Run the verification command**

Run: `APP_VARIANT=preview npx expo config --type public`

- [ ] **Step 2: Check output**

Expected:
- `name` should be `"msa (Preview)"`
- `ios.bundleIdentifier` should be `"com.pixelthread.msa.preview"`
- `android.package` should be `"com.pixelthread.msa.preview"`

---

### Task 4: Verify Production Configuration

- [ ] **Step 1: Run the verification command**

Run: `npx expo config --type public`

- [ ] **Step 2: Check output**

Expected:
- `name` should be `"msa"`
- `ios.bundleIdentifier` should be `"com.pixelthread.msa"`
- `android.package` should be `"com.pixelthread.msa"`

---

### Task 5: Cleanup and Finalization

**Files:**
- Delete: `app.json`

- [ ] **Step 1: Delete `app.json`**

Run: `rm app.json`

- [ ] **Step 2: Verify one last time**

Run: `npx expo config --type public`

- [ ] **Step 3: Commit**

```bash
git add app.json
git commit -m "chore: remove static app.json in favor of app.config.ts"
```
