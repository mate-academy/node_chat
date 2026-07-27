module.exports = {
  extends: '@mate-academy/eslint-config',

  env: {
    browser: true,
    jest: true,
  },

  rules: {
    'no-proto': 0,
  },

  plugins: ['jest'],

  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      plugins: ['@typescript-eslint', 'jsx-a11y'],
      extends: ['plugin:@typescript-eslint/recommended'],
      rules: {
        'no-undef': 'off',
        'no-shadow': 'off',
        '@typescript-eslint/no-shadow': 'error',
      },
    },
  ],
};
