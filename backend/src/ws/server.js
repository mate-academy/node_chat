/* eslint-disable no-console */
const { WebSocketServer } = require('ws');
const { WsError } = require('../exceptions/ws.error');
const eventHandlers = require('./eventHandlers');

function setupWebSocket(server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        const handler = eventHandlers[data.event];

        if (!handler) {
          ws.send(
            JSON.stringify({
              event: 'error',
              text: 'Unknown event',
              code: 'UNKNOWN_EVENT',
            }),
          );

          return;
        }

        await handler(wss, data);
      } catch (error) {
        if (error instanceof WsError) {
          ws.send(
            JSON.stringify({
              event: 'error',
              text: error.message,
              code: error.code,
              errors: error.errors,
            }),
          );

          return;
        }

        console.error('Internal server error', error);

        ws.send(
          JSON.stringify({
            event: 'error',
            text: 'Internal server error',
            code: 'UNKNOW_ERROR',
          }),
        );
      }
    });
  });

  console.log('🟢 Web socket server is running');
}

module.exports = {
  setupWebSocket,
};
