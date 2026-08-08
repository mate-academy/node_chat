module.exports = {
  extends: '@mate-academy/eslint-config',

  env: {
    browser: true,
    node: true,
    jest: true,
  },

  rules: {
    'no-proto': 0,
    'no-shadow': 0,
  },

  plugins: ['jest'],
};
