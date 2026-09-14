module.exports = {
  extends: [
    '@mate-academy/eslint-config',
    'plugin:@typescript-eslint/recommended',
  ],
  env: {
    jest: true,
  },
  rules: {
    'no-proto': 0,
  },
  parser: '@typescript-eslint/parser',
  plugins: ['jest', '@typescript-eslint'],
};
