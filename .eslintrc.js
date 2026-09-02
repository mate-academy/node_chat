module.exports = {
  extends: '@mate-academy/eslint-config',
  ignorePatterns: ['dist/', 'src/generated/'],
  env: {
    browser: false,
    node: true,
    jest: true,
  },
  rules: {
    'no-proto': 0,
  },
  plugins: ['jest'],
  overrides: [
    {
      files: ['**/*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
      plugins: ['@typescript-eslint'],
      extends: ['plugin:@typescript-eslint/recommended'],
      rules: {
        indent: 'off',
        'no-useless-constructor': 'off',
        '@typescript-eslint/no-useless-constructor': 'error',
      },
    },
    {
      files: ['scripts/**/*.ts'],
      rules: {
        'no-console': 'off',
      },
    },
  ],
};
