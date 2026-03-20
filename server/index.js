/* eslint-disable no-console */
'use strict';

const express = require('express');
const WebSocket = require('ws');

async function start() {
  const app = express();
  app.use(express.json());

  const server = app.listen(3000, () =>
    console.log('server running on 3000 port'),
  );

  const wss = new WebSocket.Server({ server });

  const rooms = {
    general: [],
  };

  wss.on('connection', (ws) => {
    console.log('User connected');

    ws.on('message', (data) => {
      const message = JSON.parse(data);
      console.log('received', message);

      switch (message.type) {
        case 'join':
          ws.username = message.username;
          ws.room = message.room || 'general';

          if (!rooms[ws.room]) {
            rooms[ws.room] = [];
          }

          ws.send(
            JSON.stringify({
              type: 'history',
              messages: rooms[ws.room],
            }),
          );
          break;

        case 'message':
          if (!ws.room) return;

          const msg = {
            author: ws.username,
            text: message.text,
            time: new Date().toISOString(),
          };

          if (!rooms[ws.room]) {
            rooms[ws.room] = [];
          }

          rooms[ws.room].push(msg);

          wss.clients.forEach((client) => {
            if (
              client.readyState === WebSocket.OPEN &&
              client.room === ws.room
            ) {
              client.send(
                JSON.stringify({
                  type: 'message',
                  message: msg,
                }),
              );
            }
          });
          break;

        case 'create_room':
          if (!rooms[message.name]) {
            rooms[message.name] = [];
          }
          break;

        case 'delete_room':
          delete rooms[message.name];
          break;

        case 'rename_room': {
          const { oldName, newName } = message;

          if (!rooms[oldName]) return;

          if (rooms[newName]) return;

          rooms[newName] = rooms[oldName];
          delete rooms[oldName];

          wss.clients.forEach((client) => {
            if (client.room === oldName) {
              client.room = newName;
            }
          });

          break;
        }
      }
    });

    ws.on('close', () => {
      console.log('user disconnected');
    });
  });
}

start();
