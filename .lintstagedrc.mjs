/**
 * lint-staged configuration for pnpm monorepo
 *
 * ESLint:
 * - Groups files by workspace.
 * - Runs ESLint from inside each workspace so flat config resolves correctly.
 * - Uses --fix and --cache.
 * - Properly quotes filenames.
 *
 * Prettier:
 * - Runs from repo root.
 * - Uses root config as fallback.
 */

function getWorkspace(file) {
  const match = file.match(/(apps\/[^/]+|packages\/[^/]+)/);
  return match?.[1];
}

export default {
  '*.{js,jsx,ts,tsx}': (files) =>
    [...new Set(files.map(getWorkspace).filter(Boolean))].map(
      (workspace) => `cd "${workspace}" && pnpm lint`,
    ),

  '*.{json,md,css,yml,yaml}': ['prettier --write'],
};
