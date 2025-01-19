import eslintPluginJest from 'eslint-plugin-jest';
import mateAcademyConfig from '@mate-academy/eslint-config';

export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    plugins: {
      jest: eslintPluginJest,
    },
    rules: {
      'no-proto': 'off',
    },
    settings: {
      ...mateAcademyConfig.settings,
    },
  },
  {
    files: ['**/*.test.js', '**/*.spec.js'],
    ...mateAcademyConfig,
    env: {
      jest: true,
    },
  },
];
