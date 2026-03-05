module.exports = {
  extends: '@mate-academy/eslint-config',
  env: {
    jest: true,
    browser: true
  },
  parserOptions: {
    requireConfigFile: false,
    sourceType: 'module',
    babelOptions: {
      plugins: ['@babel/plugin-syntax-jsx']
    }
  },
  rules: {
    'no-proto': 0,
    'function-paren-newline': 0,
    'react/jsx-uses-vars': 'error',
    'react/jsx-uses-react': 'error'
  },
  plugins: ['jest', 'react']
};
