const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const unusedImports = require('eslint-plugin-unused-imports');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'ios/*', 'android/*'],
  },
  {
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      'react/display-name': 'off',
      'import/no-unresolved': 'off',
      'no-undef': 'off',
      'import/no-named-as-default-member': 'off',

      // Remove unused imports
      'unused-imports/no-unused-imports': 'error',

      // Report unused variables
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
    },
  },
]);
