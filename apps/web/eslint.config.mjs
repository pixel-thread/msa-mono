import pluginQuery from '@tanstack/eslint-plugin-query';
import tanstackRouter from '@tanstack/eslint-plugin-router';
import { defineConfig, globalIgnores } from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tseslint from 'typescript-eslint';

const eslintConfig = defineConfig([
  ...pluginQuery.configs['flat/recommended'],
  ...tanstackRouter.configs['flat/recommended'],
  ...tseslint.configs.recommended,
  {
    plugins: {
      'react-hooks': reactHooks,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'no-restricted-imports': ['warn', { patterns: ['../*', '../../*', '../../../*'] }],
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^react$', '^@?\\w'], // packages
            ['^@/'], // aliases
            ['^\\.\\.(?!/?$)', '^\\.\\./?$'], // parent imports
            ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'], // sibling imports
            ['^.+\\.?(css)$'], // styles
          ],
        },
      ],
    },
  },
  globalIgnores([
    'dist/**',
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    '.vercel/**',
    'node_modules/**',
    'src/routeTree.gen.ts',
  ]),
]);

export default eslintConfig;
