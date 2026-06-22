module.exports = {
  extends: '@mate-academy/eslint-config',
  env: {
    node: true,
    es2022: true,
    jest: true,
  },
  parserOptions: {
    sourceType: 'module',
  },
  rules: {
    'no-proto': 0,
  },
  plugins: ['jest'],
};
