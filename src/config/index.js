const path = require('path');

const SRC_DIR = path.join(__dirname, '..');

module.exports = {
  PORT: process.env.PORT || 3000,
  CLIENT_DIR: path.join(SRC_DIR, 'client'),
  DATA_FILE: path.join(SRC_DIR, '..', 'data', 'chat-data.json'),
  HEARTBEAT_MS: 25000,
  limits: {
    username: 24,
    roomName: 30,
    text: 2000,
    messagesPerRoom: 5000,
    bodyBytes: 16 * 1024,
  },
};
