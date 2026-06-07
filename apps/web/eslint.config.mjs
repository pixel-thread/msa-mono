import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import tanstackRouter from '@tanstack/eslint-plugin-router';

const eslintConfig = defineConfig([
  ...tanstackRouter.configs['flat/recommended'],
  ...tseslint.configs.recommended,
  {
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'no-restricted-imports': [
        'warn',
        {
          patterns: ['../*', '../../*', '../../../*'],
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
