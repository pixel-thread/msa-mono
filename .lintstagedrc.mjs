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
const ROOT_PREFIX = process.cwd();

function toRelative(file) {
  return file.startsWith(ROOT_PREFIX) ? file.slice(ROOT_PREFIX.length + 1) : file;
}

function getWorkspaceDir(file) {
  const rel = toRelative(file);
  const match = rel.match(/^(apps\/[^/]+|packages\/[^/]+)/);
  return match ? match[1] : null;
}

export default {
  '*.{ts,tsx,js,jsx,mjs,cjs}': (filenames) => {
    const groups = {};
    for (const f of filenames) {
      const dir = getWorkspaceDir(f);
      const key = dir ?? '__root__';
      (groups[key] ??= []).push(toRelative(f));
    }

    return Object.entries(groups).map(([key, files]) => {
      if (key === '__root__') {
        return `npx --no-install eslint --fix --no-warn-ignored ${files.join(' ')}`;
      }
      const prefix = key + '/';
      const relativeFiles = files.map((f) =>
        f.startsWith(prefix) ? f.slice(prefix.length) : f,
      );
      return `cd ${key} && npx --no-install eslint --fix --no-warn-ignored ${relativeFiles.join(' ')}`;
    });
  },

  '*.{ts,tsx,js,jsx,json,md,css,yml,yaml,graphql}': ['prettier --write'],
};
