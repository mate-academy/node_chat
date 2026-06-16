module.exports = [
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { react: require('eslint-plugin-react') },
    settings: { react: { version: 'detect' } },
    rules: {},
  },
];
