module.exports = {
  extends: '@mate-academy/eslint-config',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    babelOptions: {
      plugins: ['@babel/plugin-syntax-jsx'],
    },
  },
  env: {
    browser: true,
    jest: true,
    node: true,
  },
  rules: {
    'no-console': 0,
    'no-proto': 0,
    'no-shadow': 0,
    'react/jsx-uses-vars': 'error',
  },
  plugins: ['jest', 'react'],
  settings: {
    react: {
      version: 'detect',
    },
  },
};
