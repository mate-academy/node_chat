module.exports = {
  extends: ['@mate-academy/eslint-config', 'plugin:react/recommended'],

  parser: '@babel/eslint-parser',
  parserOptions: {
    requireConfigFile: false,
    babelOptions: {
      presets: ['@babel/preset-react'],
    },
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  env: {
    browser: true,
    node: true,
    jest: true,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'indent': 0,
    'comma-dangle': 0,
    'function-paren-newline': 0,
    'no-proto': 0,
    'react/prop-types': 0,
    'react/react-in-jsx-scope': 0,
    'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    'consistent-return': 0,
    'import/no-unresolved': 0,
  },
};
