'use strict';

import { WebSocketServer } from 'ws';

import { server } from './server.js';
import { emitter as messageEmitter } from './controllers/message.controller.js';
import { emitter as roomEmitter } from './controllers/room.controller.js';
import { MessageAction } from './types/message.type.js';

const wss = new WebSocketServer({ server });

wss.on('connection', (client) => {
  client.on('message', (message) => {

    /** @type { import('./types/message.type.js').MessageClient } */
    const data = JSON.parse(message.toString());

    console.dir(data);

    switch (data.action) {
      case MessageAction.ENTER_THE_ROOM: {
        const { roomId } = data.payload;

        console.info(`
        roomId = ${roomId}
        `);

        if (!roomId) {
          return;
        }

        client.roomId = roomId;

        console.info(`
        client.roomId = ${client.roomId}
        `);

        return;
      }

      case MessageAction.LEAVE_THE_ROOM: {
        delete client.roomId;
        return;
      }

      default:
        console.info(`ERROR`);
        break;
    }
  });

  client.once('close', () => {
    delete client.roomId;
  });
});

messageEmitter.on('create', (message) => {
  for (const client of wss.clients) {
    if (client.roomId === message.roomId) {
      client.send(JSON.stringify({ action: MessageAction.CREATE_MESSAGE, payload: message }));
    }
  }
});

roomEmitter.on('update', (rooms) => {
  for (const client of wss.clients) {
    client.send(JSON.stringify(rooms));
  }
});
