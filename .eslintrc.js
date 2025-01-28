module.exports = {
  extends: '@mate-academy/eslint-config',
  env: {
    jest: true,
    browser: true,
    node: true,
  },
  rules: {
    'no-proto': 0,
    'no-console': 0,
  },
  plugins: ['jest'],
};
