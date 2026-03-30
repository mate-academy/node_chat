module.exports = {
  extends: [
    '@mate-academy/eslint-config',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  env: {
    jest: true,
  },
  plugins: ['jest', '@typescript-eslint'],
  rules: {
    'no-proto': 0,
  },
};
