module.exports = {
  extends: '@mate-academy/eslint-config',
  ignorePatterns: ['src/frontend/**'],
  env: {
    jest: true,
  },
  rules: {
    'no-proto': 0,
  },
  plugins: ['jest'],
};
