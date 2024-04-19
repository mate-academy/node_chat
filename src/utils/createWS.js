'use strict';

const WebSocket = require('ws');
const messageService = require('../services/message.service');
const { wsMessageSchema } = require('./schemas');

function createWS(server) {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    ws.on('message', async (data) => {
      const parsedMessage = JSON.parse(data);

      try {
        await wsMessageSchema.validate(parsedMessage);

        const newMessage = await messageService.add(parsedMessage);

        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(newMessage));
          }
        });
      } catch (e) {
        ws.send(JSON.stringify({ error: e.message }));
      }
    });

    ws.on('error', () => {
      // eslint-disable-next-line no-console
      console.log('Websocket Error');
    });
  });
}

module.exports = {
  createWS,
};
