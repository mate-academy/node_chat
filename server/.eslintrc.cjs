module.exports = {
  root: true,

  extends: ['@mate-academy/eslint-config'],

  parser: '@typescript-eslint/parser',
  ignorePatterns: ['.eslintrc.cjs', 'dist/', 'node_modules/'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },

  plugins: ['@typescript-eslint'],

  env: {
    node: true,
    es2022: true,
  },

  rules: {
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': 'error',
    'no-console': 'off',
  },
  overrides: [
    {
      files: ['**/*.d.ts'],
      rules: {
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
  ],
};
