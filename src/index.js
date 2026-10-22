'use strict';

const path = require('path');
const { ChatRepository } = require('./models/ChatRepository');
const { ChatService } = require('./services/ChatService');
const {
  createChatWebSocketServer,
} = require('./websocket/chatWebSocketServer');

function createChatServer({
  port = Number(process.env.WS_PORT) || 3005,
  dataFile = process.env.CHAT_DATA_FILE ||
    path.join(__dirname, '..', 'data', 'chat-data.json'),
} = {}) {
  const repository = new ChatRepository(dataFile);
  const chatService = new ChatService(repository);

  return createChatWebSocketServer({ port, chatService });
}

if (require.main === module) {
  try {
    const server = createChatServer();

    server.on('listening', () => {
      process.stdout.write(
        `Chat WebSocket server listening on port ${server.address().port}\n`,
      );
    });
  } catch (error) {
    process.stderr.write(`Failed to start chat server: ${error}\n`);
    process.exitCode = 1;
  }
}

module.exports = { createChatServer };
