module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // Plain JSX project without PropTypes — prop validation is not used.
    'react/prop-types': 'off',
  },
  overrides: [
    {
      // Config files run in Node, not the browser.
      files: ['.eslintrc.cjs', 'vite.config.js'],
      env: {
        node: true,
      },
    },
  ],
};
