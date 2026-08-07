module.exports = {
  extends: '@mate-academy/eslint-config',

  env: {
    browser: true,
    jest: true,
    es2022: true,
  },

  parser: '@typescript-eslint/parser',

  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },

  plugins: [
    'jest',
    '@typescript-eslint',
    'jsx-a11y',
  ],

  extends: [
    '@mate-academy/eslint-config',
    'plugin:@typescript-eslint/recommended',
  ],

  rules: {
    'no-proto': 0,
    'no-undef': 'off',
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': 'error',
  },
};
