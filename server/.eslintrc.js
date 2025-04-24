module.exports = {
  env: {
    node: true, // Use Node.js environment globals
    es2021: true,
  },
  extends: ['eslint:recommended', 'prettier'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  ignorePatterns: [
    'node_modules/',
    'build/', // Or 'dist/' depending on your build output
    '.env*', // Ignore environment files
    '*.config.js', // Ignore other common JS config files (like vite.config.js, prettier.config.js)
    '*.config.ts', // Ignore common TS config files (like vite.config.ts)
    '.eslintrc.js', // <-- Add this line to ignore the ESLint config itself
  ],
};
