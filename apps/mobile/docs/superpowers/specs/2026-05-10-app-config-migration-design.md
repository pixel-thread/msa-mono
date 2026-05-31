# Design Spec: Dynamic app.config.ts Migration

**Status:** DRAFT
**Created:** 2026-05-10
**Topic:** Configuration Migration

## 1. Purpose
Migrate the static `app.json` configuration to a dynamic `app.config.ts`. This enables the application to coexist as different variants (Development, Preview, Production) on a single device by dynamically adjusting identifiers and names.

## 2. Approach: Auto-Suffixing
We will use an environment variable `APP_VARIANT` to determine the current environment.

| Environment | APP_VARIANT | App Name | Package Name / Bundle ID |
|-------------|-------------|----------|--------------------------|
| Production | (default) | msa | com.pixelthread.msa |
| Preview | `preview` | msa (Preview) | com.pixelthread.msa.preview |
| Development | `development`| msa (Dev) | com.pixelthread.msa.dev |

## 3. Architecture
- **Environment Variable:** `process.env.APP_VARIANT`.
- **Base Configuration:** Extracted from the current `app.json`.
- **Dynamic Overrides:** Logic within `app.config.ts` will calculate the final `name`, `ios.bundleIdentifier`, and `android.package`.

## 4. Implementation Details
The `app.config.ts` will:
1. Import `ExpoConfig` and `ConfigContext` from `expo/config`.
2. Define a helper to get the variant suffix.
3. Return the merged configuration object.

## 5. Verification Plan
- Run `npx expo config` for each variant:
  - `APP_VARIANT=development npx expo config`
  - `APP_VARIANT=preview npx expo config`
  - `npx expo config` (Production)
- Confirm that the package name and app name change accordingly.

## 6. Cleanup
- Remove the original `app.json` once `app.config.ts` is verified to prevent configuration conflicts.
