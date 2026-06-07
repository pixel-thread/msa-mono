# Husky + lint-staged Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up Husky git hooks with lint-staged to auto-format and lint code on every commit, with ESLint and Prettier config resolving from each workspace (app/package level first, root as fallback).

**Architecture:**

- `husky` manages the `pre-commit` git hook
- `lint-staged` runs formatters/linters against only the files staged for commit
- ESLint flat config resolves per-workspace — since flat config uses CWD-based resolution (not file-location-based), ESLint must run from within each workspace directory to pick up that workspace's `eslint.config.*`
- Prettier auto-discovers its config by walking up from each file's directory, so it runs from the root and naturally finds per-workspace `.prettierrc` files, falling back to a root `.prettierrc` for `packages/*` that lack their own
- A root `.prettierrc` provides the fallback defaults

**Tech Stack:** Husky v9, lint-staged v15+, Prettier v3, ESLint v9 (flat config), pnpm workspaces, Turborepo

---

## File Structure

**Files to create:**

- `.prettierrc` (root) — fallback Prettier config for packages without their own
- `.husky/pre-commit` — git pre-commit hook that runs lint-staged
- `.husky/_/.gitignore` — ignore husky internal auto-generated files within `_/`
- `.lintstagedrc.mjs` — lint-staged configuration with per-workspace ESLint routing

**Files to modify:**

- `package.json` (root) — add `prepare` script, `husky` + `lint-staged` devDependencies
- `.gitignore` — add `.husky/_` entry

**Dependencies installed by pnpm (hoisted to root):**

- `husky` — git hooks manager
- `lint-staged` — run linters on staged files

`eslint` and `prettier` are already hoisted to root `node_modules/.bin/` by pnpm (confirmed — binaries exist at root).

---

### Task 1: Create root `.prettierrc` (fallback config)

**Files:**

- Create: `.prettierrc`

This config is the fallback for `packages/*` that lack their own `.prettierrc` (`packages/shared`, `packages/types`, `packages/ui-web`, `packages/ui-native`). Prettier walks up the directory tree from each file's location to find the nearest config — when a package has none, it will find this root config.

The options are derived as the common subset across the three existing app-level configs (`apps/web/.prettierrc`, `apps/backend/.prettierrc`, `apps/mobile/prettier.config.js`).

- [ ] **Create `.prettierrc` with fallback defaults**

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

- [ ] **Verify Prettier resolution**

```bash
# Should resolve to apps/web/.prettierrc (not the root one)
npx prettier --find-config-path apps/web/src/main.tsx
# Expected: apps/web/.prettierrc

# Should resolve to root .prettierrc (fallback)
npx prettier --find-config-path packages/shared/src/index.ts
# Expected: .prettierrc
```

---

### Task 2: Install root devDependencies

**Files:**

- Modify: `package.json` (root) — add devDependencies

- [ ] **Install husky and lint-staged**

```bash
pnpm add -D -w husky lint-staged
```

Expected: packages added to `package.json` and `pnpm-lock.yaml` updated.

---

### Task 3: Initialize Husky

**Files:**

- Create: `.husky/pre-commit`
- Create: `.husky/_/.gitignore`

- [ ] **Initialize husky directory**

```bash
pnpm exec husky init
```

Expected: Creates `.husky/` directory with a sample `pre-commit` hook file and a `.gitignore` inside `.husky/_/`.

- [ ] **Review generated files**

Read `.husky/pre-commit` — the default content will be something like:

```
pnpm exec lint-staged
```

Leave this as-is. The `pnpm exec lint-staged` command runs `lint-staged` from the project root, which will read `.lintstagedrc.mjs` for its configuration.

- [ ] **Verify `.husky/_/.gitignore` exists**

This file should contain `*` (gitignore all files in the `_/` directory — these are Husky's auto-generated internals and must not be committed).

---

### Task 4: Create `.lintstagedrc.mjs`

**Files:**

- Create: `.lintstagedrc.mjs`

This is the core configuration. It must handle the ESLint flat config CWD-based resolution challenge — ESLint looks for `eslint.config.*` starting from the current working directory, NOT from the file's location. Since root has no `eslint.config.*`, running ESLint from root won't find any workspace's config.

The solution: Group files by their workspace (`apps/*` or `packages/*`), then run ESLint from within each workspace's directory so it finds that workspace's `eslint.config.*`.

Prettier runs from root because it uses the opposite resolution strategy — it walks up from each file's location to find config.

- [ ] **Create `.lintstagedrc.mjs`**

```js
/**
 * lint-staged configuration for pnpm monorepo
 *
 * ESLint (flat config): runs from within each workspace directory
 *   because flat config resolves from CWD, not from the file's location.
 *   Grouping files by workspace and cd-ing in ensures each file is
 *   linted with its workspace's eslint.config.*.
 *
 * Prettier: runs from root because Prettier resolves config by walking
 *   up from each file's directory. The root .prettierrc serves as
 *   fallback for packages/* that lack their own prettier config.
 */
export default {
  '*.{ts,tsx,js,jsx,mjs,cjs}': (filenames) => {
    const groups = {};
    for (const f of filenames) {
      const match = f.match(/^(apps\/[^/]+|packages\/[^/]+)/);
      const dir = match ? match[1] : null;
      (groups[dir] ??= []).push(f);
    }

    return Object.entries(groups).map(([dir, files]) => {
      if (!dir) {
        // Root-level JS/TS files — use any available eslint at root
        return `eslint --fix ${files.join(' ')}`;
      }
      const prefix = dir + '/';
      const relativeFiles = files.map((f) => (f.startsWith(prefix) ? f.slice(prefix.length) : f));
      return `cd ${dir} && npx --no-install eslint --fix ${relativeFiles.join(' ')}`;
    });
  },

  '*.{ts,tsx,js,jsx,json,md,css,yml,yaml,graphql}': ['prettier --write'],
};
```

---

### Task 5: Update root `package.json` scripts

**Files:**

- Modify: `package.json` (root) — add `prepare` script

- [ ] **Add `prepare` script**

```bash
pnpm pkg set scripts.prepare=husky
```

Or edit `package.json` directly:

```json
{
  "scripts": {
    "prepare": "husky",
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint"
  }
}
```

The `prepare` script runs automatically after `pnpm install`, invoking Husky to install its git hooks.

---

### Task 6: Update `.gitignore`

**Files:**

- Modify: `.gitignore` — add `.husky/_`

- [ ] **Add `.husky/_` to `.gitignore`**

Add this line after the existing IDE section (~line 86 in the current file):

```
# =========================================
# Husky
# =========================================
.husky/_
```

Or insert before the "Temporary" section. The key point: `.husky/_` contains auto-generated Husky internal files. The hook files themselves (like `.husky/pre-commit`) SHOULD be committed.

---

### Task 7: Verify the full setup

- [ ] **Stage all new files**

```bash
git add .prettierrc .husky/pre-commit .husky/_/.gitignore .lintstagedrc.mjs package.json pnpm-lock.yaml .gitignore
```

- [ ] **Try committing with a deliberate formatting issue**

Make a small formatting change in a file (e.g., add extra whitespace or change single quotes to double quotes in `packages/shared/src/index.ts`), then stage and commit:

```bash
# Make a deliberate formatting change
git add -A
git commit -m "test: verify lint-staged formatting"
```

Expected:

- `prettier --write` runs and fixes the formatting
- `eslint --fix` runs and fixes any lint issues
- Hook passes, commit succeeds

If hook fails, inspect the error output — likely causes:

- ESLint can't find config for a workspace → verify the group logic in `.lintstagedrc.mjs`
- `npx --no-install` fails because eslint isn't found → verify `node_modules/.bin/eslint` exists in the workspace

- [ ] **Verify the files are tracked by git**

```bash
git status
```

Expected: Only the intended files are shown. `.husky/_/` contents should NOT appear (they're gitignored via `.husky/_/.gitignore`).

---

## Config Resolution Summary

| File                          | Prettier Config Source           | ESLint Config Source                                    |
| ----------------------------- | -------------------------------- | ------------------------------------------------------- |
| `apps/web/src/*.ts`           | `apps/web/.prettierrc`           | `apps/web/eslint.config.mjs` (cd into workspace)        |
| `apps/backend/src/*.ts`       | `apps/backend/.prettierrc`       | `apps/backend/eslint.config.mjs` (cd into workspace)    |
| `apps/mobile/src/*.ts`        | `apps/mobile/prettier.config.js` | `apps/mobile/eslint.config.js` (cd into workspace)      |
| `packages/shared/src/*.ts`    | Root `.prettierrc` (fallback)    | `packages/shared/eslint.config.mjs` (cd into workspace) |
| `packages/types/src/*.ts`     | Root `.prettierrc` (fallback)    | `packages/types/eslint.config.js` (cd into workspace)   |
| `packages/ui-web/src/*.ts`    | Root `.prettierrc` (fallback)    | Workspace config (cd into workspace)                    |
| `packages/ui-native/src/*.ts` | Root `.prettierrc` (fallback)    | Workspace config (cd into workspace)                    |

## Known Edge Cases

1. **Root-level JS/TS files**: If someone adds a `.ts` or `.js` file at the monorepo root, the lint-staged ESLint command will try to lint it from root. Root has no `eslint.config.*`, so this would fail. Currently there are no root-level JS/TS files, so this is a non-issue. If one is added later, a root `eslint.config.mjs` should be created.

2. **`packages/eslint-config` has no prettier config**: The root `.prettierrc` fallback covers this package (and any other package added in the future without its own prettier config).

3. **Excessively long command lines**: If a commit stages hundreds of files, the ESLint command string might exceed OS shell limits. In practice, commits normally touch far fewer files. If this becomes an issue, lint-staged v15+ supports `processConcurrency` and `chunkSize` options.

4. **pnpm symlink resolution**: `npx --no-install eslint --fix` requires ESLint to be available in the workspace's `node_modules/.bin/`. This is confirmed to work with the existing pnpm workspace setup. If a workspace doesn't declare eslint as a dependency, it won't have the binary — but all current workspaces do.
