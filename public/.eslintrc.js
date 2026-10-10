module.exports = {
  env: {
    browser: true,
    node: false,
  },
  globals: {
    io: 'readonly', // Tells ESLint that 'io' comes from the Socket.IO script
  },
  rules: {
    'no-console': 'off', // Console logs are fine in the browser
    'no-alert': 'off', // We are using prompt/alert for simplicity
    'no-undef': 'off', // Prevents errors for browser globals like localStor.
  },
};
