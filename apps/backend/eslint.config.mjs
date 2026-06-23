import js from '@eslint/js';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'dist',
      'node_modules',
      '.pnpm-store',
      'src/__tests__',
      'src/__mocks__',
      'src/**/*.tsx',
    ],
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
      parserOptions: {
        project: './tsconfig.json',
      },
      globals: {
        ...globals.node,
      },
    },

    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-inferrable-types': 'error',
      // Async / Promise safety

      '@typescript-eslint/no-floating-promises': 'error',

      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'no-console': 'warn',
    },
  },
);
