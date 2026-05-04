'use strict';

const http = require('http');
const { createApp } = require('./app');
const { connectDatabase } = require('./database');
const { createChatWebSocketServer } = require('./websocket/chatSocket');

const app = createApp();
const server = http.createServer(app);
const port = process.env.PORT || 3001;

async function start() {
  try {
    await connectDatabase();
    createChatWebSocketServer(server);

    server.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`Chat backend is listening on port ${port}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Unable to start chat backend:', error);
    process.exit(1);
  }
}

start();

module.exports = {
  app,
  server,
  start,
};
