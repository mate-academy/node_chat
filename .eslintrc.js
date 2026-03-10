module.exports = {
  extends: [
    '@mate-academy/eslint-config',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
  ],
  env: {
    jest: true,
    browser: true,
    node: true,
  },
  parserOptions: {
    requireConfigFile: false,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['jest', 'react'],
  rules: {
    'no-proto': 0,
    'no-console': 0,
    'react/react-in-jsx-scope': 'off',
    'no-shadow': [
      'error',
      {
        builtinGlobals: false,
        hoist: 'all',
        allow: [],
      },
    ],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
