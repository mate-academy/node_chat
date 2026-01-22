const config = {
  port: process.env.PORT || 3000,

  maxHistoryLength: 100,

  pingTimeout: 10000,
  pingInterval: 5000,
};

module.exports = config;
