module.exports = {
  extends: '@mate-academy/eslint-config',
  env: {
    jest: true,
  },
  rules: {
    'no-proto': 0,
  },
  plugins: ['jest'],
  overrides: [
    {
      files: ['src/client/**/*.js'],
      env: {
        browser: true,
      },
    },
  ],
};
