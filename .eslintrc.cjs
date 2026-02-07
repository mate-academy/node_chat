module.exports = {
  extends: '@mate-academy/eslint-config',
  env: {
    jest: true,
    node: true,
  },
  rules: {
    'no-proto': 0,
    'no-console': 0,
  },
  plugins: ['jest'],
  overrides: [
    {
      files: ['*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.json',
      },
      plugins: ['@typescript-eslint'],
      rules: {
        'no-shadow': 'off',
        '@typescript-eslint/no-shadow': 'error',
      },
    },
  ],
};
