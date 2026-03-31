module.exports = {
  extends: '@mate-academy/eslint-config',
  env: {
    jest: true
  },
  rules: {
    'no-proto': 0
  },
  plugins: ['jest'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      extends: [
        '@mate-academy/eslint-config',
        'plugin:@typescript-eslint/recommended'
      ],
      rules: {
        'no-proto': 0,
        '@typescript-eslint/no-unused-vars': 'error'
      }
    }
  ]
};
