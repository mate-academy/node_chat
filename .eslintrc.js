module.exports = {
  extends: '@mate-academy/eslint-config',
  env: {
    jest: true,
    node: true,
  },
  rules: {
    'no-proto': 0,
    'no-console': 0,
    'max-len': ['error', { code: 80, ignoreComments: true }],
  },
  plugins: ['jest'],
  overrides: [
    {
      files: ['src/public/js/**/*.js'],
      env: {
        browser: true,
        node: false,
      },
      globals: {
        io: 'readonly',
      },
    },
  ],
};
