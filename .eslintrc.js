module.exports = {
  extends: '@mate-academy/eslint-config',
  env: {
    jest: true
  },
  rules: {
    'no-proto': 0,
    'no-console': 0
  },
  plugins: ['jest'],
  // client/ is a separate React app (browser globals, JSX) linted by its own
  // oxlint config - this Node-oriented config would false-positive on it.
  ignorePatterns: ['client/']
};
