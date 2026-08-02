'use strict';

// Kept separate from the root .eslintrc.js because `npm install` runs
// `mate-scripts update`, which overwrites the root config with a template
// on every install. A nested config here survives that overwrite.
module.exports = {
  env: { browser: true },
  globals: { io: 'readonly' },
};
