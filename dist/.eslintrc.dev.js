"use strict";

module.exports = {
  "extends": '@mate-academy/eslint-config',
  env: {
    jest: true
  },
  rules: {
    'no-proto': 0
  },
  plugins: ['jest'],
  overrides: [{
    files: ['src/client/**/*.{js,jsx}'],
    parser: 'espree',
    env: {
      browser: true,
      es2022: true
    },
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true
      }
    },
    rules: {
      'no-unused-vars': ['error', {
        varsIgnorePattern: '^[A-Z_]'
      }],
      'no-shadow': ['error', {
        builtinGlobals: false
      }]
    }
  }]
};