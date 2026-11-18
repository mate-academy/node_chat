'use strict';

const ws = require('ws');
const emitter = require('./emitter');
const roomsService = require('./services/rooms.service');

function initSocket(server) {
  const wss = new ws.WebSocketServer({ server });
  const messages = {};

  emitter.on('rooms', () => {
    const rooms = roomsService.getAll();

    for (const client of wss.clients) {
      client.send(JSON.stringify({ type: 'rooms', rooms }));
    }
  });

  wss.on('connection', (socket) => {
    socket.on('message', (data) => {
      const event = JSON.parse(data.toString());

      if (event.type === 'join') {
        socket.roomId = event.roomId;
        socket.username = event.username;

        socket.send(
          JSON.stringify({
            type: 'history',
            messages: messages[event.roomId] || [],
          }),
        );

        return;
      }

      if (event.type === 'message') {
        if (!socket.username) {
          return;
        }

        const message = {
          author: socket.username,
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
