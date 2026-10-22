'use strict';

const WebSocket = require('ws');
const { ChatController } = require('../controllers/ChatController');

const MAX_PAYLOAD_BYTES = 16 * 1024;

function createChatWebSocketServer({ port, chatService }) {
  const server = new WebSocket.Server({
    port,
    maxPayload: MAX_PAYLOAD_BYTES,
  });
  const clients = new Set();
  const transport = {
    send(client, event) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(event));
      }
    },
    sendError(client, message) {
      this.send(client, { type: 'error', message });
    },
    broadcast(event) {
      for (const client of clients) {
        this.send(client, event);
      }
    },
    broadcastToRoom(roomId, event) {
      for (const client of chatService.getRoomMembers(roomId)) {
        this.send(client, event);
      }
    },
  };
  const controller = new ChatController(chatService, transport);

  server.on('connection', (client) => {
    clients.add(client);
    chatService.connect(client);

    transport.send(client, {
      type: 'rooms',
      rooms: chatService.getRooms(),
    });

    client.on('message', (payload, isBinary) => {
      if (isBinary) {
        transport.sendError(client, 'Only JSON text messages are supported.');

        return;
      }

      let request;

      try {
        request = JSON.parse(payload.toString());
      } catch {
        transport.sendError(client, 'Invalid JSON request.');

        return;
      }

      try {
        controller.handleRequest(client, request);
      } catch (error) {
        process.stderr.write(`Failed to handle WebSocket request: ${error}\n`);
        transport.sendError(client, 'The request could not be completed.');
      }
    });

    client.on('close', () => {
      clients.delete(client);
      chatService.disconnect(client);
    });
  });

  server.on('error', (error) => {
    process.stderr.write(`WebSocket server error: ${error}\n`);
  });

  return server;
}

module.exports = { createChatWebSocketServer };
