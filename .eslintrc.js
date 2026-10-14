module.exports = {
  extends: '@mate-academy/eslint-config',
  env: {
    jest: true,
  },
  parserOptions: {
    project: './src/frontend/tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  rules: {
    'no-proto': 0,
  },
  plugins: ['jest'],
};


