/* eslint-disable no-shadow */
/* eslint-disable no-console */
const { WebSocketServer } = require('ws');
const { EventEmitter } = require('events');

const socketEmitter = new EventEmitter();
let onlineUsers = [];

const runWSServer = (server) => {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    ws.on('message', async (message) => {
      const msg = JSON.parse(message);

      switch (msg.event) {
        case 'connection': {
          if (onlineUsers.some((el) => el.userId === msg.userId)) {
            return;
          }

          onlineUsers.push({ userId: msg.userId, ws });

          const message = {
            type: 'onlineUsers',
            onlineUsers: onlineUsers.map(({ ws, ...rest }) => rest),
          };

          broadcastServiceMessage(message);
          break;
        }

        case 'messageSend':
          const recipient = onlineUsers.find(
            (el) => el.userId === msg.recipient.id,
          );

          const message = {
            type: 'message',
            message: msg.message,
          };

          if (recipient) {
            recipient.ws.send(JSON.stringify(message));
          }
          break;

        default:
          console.log('Unknown message type:', msg.event);
      }
    });

    ws.on('close', (code, reason) => {
      onlineUsers = onlineUsers.filter((el) => el.ws !== ws);

      const message = {
        type: 'onlineUsers',
        onlineUsers: onlineUsers.map((el) => el.userId),
      };

      broadcastServiceMessage(message);
    });

    ws.on('error', (err) => {
      console.log('error connection', err);
    });
  });

  const broadcastServiceMessage = (message) => {
    wss.clients.forEach((client) => {
      client.send(JSON.stringify(message));
    });
  };

  socketEmitter.on('readMessages', (chatId) => {
    broadcastServiceMessage({ type: 'readMessages', chatId });
  });
};

module.exports = {
  runWSServer,
  socketEmitter,
};
