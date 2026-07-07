module.exports = {
  extends: '@mate-academy/eslint-config',
  env: {
    jest: true,
    node: true,
  },
  rules: {
    'no-proto': 0,
    'no-console': ['error', { allow: ['warn', 'error'] }],
  },
  plugins: ['jest'],
};
