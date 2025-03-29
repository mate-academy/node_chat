'use strict';
import express from 'express';
import { WebSocketServer } from 'ws';
import {
  createRoom,
  renameRoom,
  deleteRoom,
  addMessage,
  getMessages,
} from './rooms.js';

const app = express();

app.use(express.json());

const server = app.listen(5000);

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    const { type, username, room, text, newRoom } = JSON.parse(data);

    switch (type) {
      case 'join': {
        ws.room = room;
        createRoom(room);
        ws.send(sendAction('history', { messages: getMessages(room) }));
        break;
      }

      case 'message': {
        if (!ws.room) {
          return;
        }

        const message = {
          author: username,
          time: new Date().toLocaleTimeString(),
          text,
        };

        addMessage(ws.room, message);

        wss.clients.forEach((client) => {
          if (client.readyState === 1 && client.room === ws.room) {
            client.send(sendAction('message', message));
          }
        });

        break;
      }

      case 'create':
        createRoom(room);
        break;

      case 'rename': {
        renameRoom(room, newRoom);
        break;
      }

      case 'delete': {
        deleteRoom(room);

        wss.clients.forEach((client) => {
          if (client.room === room) {
            client.send(sendAction('deleted'));
          }
        });

        break;
      }

      default:
        // eslint-disable-next-line no-console
        console.warn('unknow type: ', type);
        break;
    }
  });

  // eslint-disable-next-line no-console
  ws.on('close', () => console.log('User disconnected'));
});

function sendAction(type, payload) {
  if (payload) {
    return JSON.stringify({ type, payload });
  }

  return JSON.stringify({ type });
}
