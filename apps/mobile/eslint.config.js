const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    rules: {
      'react/display-name': 'off',
      'import/no-unresolved': 'off',
      'no-undef': 'off',
      'import/no-named-as-default-member': 'off',
    },
  },
]);
