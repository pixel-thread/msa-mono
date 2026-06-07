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

const ROOT = process.cwd();

function toRelative(file) {
  return file.startsWith(ROOT + '/') ? file.slice(ROOT.length + 1) : file;
}

function getWorkspace(file) {
  const rel = toRelative(file);

  const match = rel.match(/^(apps\/[^/]+|packages\/[^/]+)/);

  return match?.[1] ?? null;
}

function quote(file) {
  return `"${file.replace(/"/g, '\\"')}"`;
}

export default {
  '*.{js,jsx,ts,tsx,mjs,cjs}': (files) => {
    const groups = new Map();

    for (const file of files) {
      const workspace = getWorkspace(file) ?? '__root__';

      if (!groups.has(workspace)) {
        groups.set(workspace, []);
      }

      groups.get(workspace).push(toRelative(file));
    }

    return [...groups.entries()].map(([workspace, workspaceFiles]) => {
      if (workspace === '__root__') {
        return [
          'npx --no-install eslint',
          '--cache',
          '--fix',
          '--no-warn-ignored',
          '--max-warnings=0',
          workspaceFiles.map(quote).join(' '),
        ].join(' ');
      }

      const prefix = `${workspace}/`;

      const relativeFiles = workspaceFiles.map((file) =>
        file.startsWith(prefix) ? file.slice(prefix.length) : file,
      );

      return [
        `cd "${workspace}" &&`,
        'npx --no-install eslint',
        '--cache',
        '--fix',
        '--no-warn-ignored',
        '--max-warnings=0',
        relativeFiles.map(quote).join(' '),
      ].join(' ');
    });
  },

  '*.{js,jsx,ts,tsx,json,md,css,scss,yml,yaml,graphql}': ['prettier --write'],
};
