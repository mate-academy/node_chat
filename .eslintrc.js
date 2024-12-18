module.exports = {
  root: true,
  extends: '@mate-academy/eslint-config',
  plugins: ['react', 'jest'],
  env: {
    es2021: true,
  },
  rules: {
    'no-proto': 0,
  },
  overrides: [
    {
      files: ['src/client/**/*.{js,jsx}'],
      env: {
        browser: true,
      },
      rules: {
        'react/jsx-uses-vars': 'error',
      },
    },
    {
      files: ['src/server/**/*.{js}'],
      env: {
        node: true,
      },
    },
    {
      files: ['**/*.test.{js,jsx,ts,tsx}'],
      env: {
        jest: true,
      },
    },
  ],
};
