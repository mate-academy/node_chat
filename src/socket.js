'use strict';

const ws = require('ws');

function initSocket(server) {
  const wss = new ws.WebSocketServer({ server });
  const messages = {};

  wss.on('connection', (socket) => {
    socket.on('message', (data) => {
      const event = JSON.parse(data.toString());

      if (event.type === 'join') {
        socket.roomId = event.roomId;

        socket.send(
          JSON.stringify({
            type: 'history',
            messages: messages[event.roomId] || [],
          }),
        );

        return;
      }

      if (event.type === 'message') {
        const message = {
          author: event.author,
          text: event.text,
          time: new Date(),
        };

        if (!messages[socket.roomId]) {
          messages[socket.roomId] = [];
        }

        messages[socket.roomId].push(message);

        for (const client of wss.clients) {
          if (client.roomId !== socket.roomId) {
            continue;
          }

          client.send(JSON.stringify({ type: 'message', message: message }));
        }
      }
    });
  });
}

module.exports = initSocket;
