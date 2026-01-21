import jestPlugin from 'eslint-plugin-jest';

export default [
  {
    files: ['**/*.js'],
    plugins: {
      jest: jestPlugin,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
    rules: {
      'no-proto': 0,
    },
  },
  {
    files: ['**/*.test.js', '**/*.spec.js'],
    rules: {
      ...jestPlugin.configs.recommended.rules,
    },
  },
];
