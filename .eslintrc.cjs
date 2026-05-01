module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ['@mate-academy/eslint-config-react'],
  parser: '@babel/eslint-parser', // Виносимо parser сюди
  parserOptions: {
    requireConfigFile: false,
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
    babelOptions: {
      presets: ['@babel/preset-react'],
    },
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'node/no-unsupported-features/es-syntax': 'off',
  },
};
