import js from '@eslint/js';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['dist', 'node_modules', '.pnpm-store', 'src/__tests__', 'src/__mocks__'],
  },

  js.configs.recommended,

  ...tseslint.configs.recommended,

  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },

    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },

  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },

    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',

      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
        },
      ],

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

      'no-console': 'warn',
    },
  },
);
