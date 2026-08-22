module.exports = {
  extends: '@mate-academy/eslint-config',

  env: {
    jest: true,
    browser: true,
    node: true,
  },

  parser: require.resolve('espree'),

  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },

  rules: {
    'no-proto': 0,
  },

  plugins: ['jest'],
};
