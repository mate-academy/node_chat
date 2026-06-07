/* eslint-disable no-console */
'use strict';

import 'dotenv/config';
import { WebSocket, WebSocketServer } from 'ws';

import app from './app';
import { roomStore } from './store/roomStore.js';

type ClientState = {
  roomId: string | null;
};

type JoinRoomPayload = {
  type: 'join_room';
  roomId: string;
};

type SendMessagePayload = {
  type: 'send_message';
  roomId: string;
  author: string;
  text: string;
};

type SocketPayload = JoinRoomPayload | SendMessagePayload;

const PORT = Number(process.env.PORT || 5000);

const server = app.listen(PORT, () => {
  process.stdout.write(`Server listening on http://localhost:${PORT}\n`);
});

const wss = new WebSocketServer({ server });
const clients = new Map<WebSocket, ClientState>();

wss.on('connection', (client) => {
  clients.set(client, { roomId: null });
  // es-lint -ignore-console.log
  console.log('A new client connected');

  client.on('message', (data) => {
    const rawMessage = data.toString();

    try {
      const payload = JSON.parse(rawMessage) as SocketPayload;

      if (payload.type === 'join_room') {
        const clientState = clients.get(client);

        if (!clientState) {
          return;
        }

        clientState.roomId = payload.roomId;

        return;
      }

      if (payload.type === 'send_message') {
        const author = payload.author.trim();
        const text = payload.text.trim();

        if (!author || !text) {
          return;
        }

        const message = roomStore.addMessageToRoom(
          payload.roomId,
          author,
          text,
        );

        if (!message) {
          return;
        }

        const responsePayload = JSON.stringify({
          type: 'message_created',
          roomId: payload.roomId,
          message,
        });

        clients.forEach((clientState, socketClient) => {
          if (
            clientState.roomId === payload.roomId &&
            socketClient.readyState === WebSocket.OPEN
          ) {
            socketClient.send(responsePayload);
          }
        });
      }
    } catch {
      // es-lint -ignore-console.log
      console.log(`Invalid websocket payload: ${rawMessage}`);
    }
  });

  client.on('close', () => {
    clients.delete(client);
  });
});
