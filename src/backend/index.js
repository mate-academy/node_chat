import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { EventEmitter } from 'events';
import { createSystemMessage } from './utils/createSystemMessage.js';

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: process.env.CLIENT_HOST,
    credentials: true,
  }),
);

app.use((req, res) => {
  res.status(404).send({ message: 'Not found' });
});

const emmiter = new EventEmitter();

let rooms = [];

const server = app.listen(3005, () => {
  // eslint-disable-next-line no-console
  console.log('Server is running on port: 3005');
});

const wss = new WebSocketServer({ server });

emmiter.on('SET_USERNAME', ({ client, payload }) => {
  client.username = payload.username;

  client.send(
    JSON.stringify({
      type: 'ROOMS_UPDATED',
      payload: {
        rooms,
      },
    }),
  );
});

emmiter.on('CREATE_ROOM', ({ client, payload }) => {
  const newRoom = {
    id: Date.now(),
    name: payload.roomName,
    messages: [],
    users: [client.username],
    creatorId: payload.creatorId,
  };

  rooms.unshift(newRoom);

  for (const ws of wss.clients) {
    ws.send(
      JSON.stringify({
        type: 'ROOMS_UPDATED',
        payload: {
          rooms,
        },
      }),
    );
  }

  client.send(
    JSON.stringify({
      type: 'ROOM_CREATED',
      payload: {
        newRoom,
      },
    }),
  );
});

emmiter.on('JOIN_ROOM', ({ client, payload }) => {
  const room = rooms.find((r) => r.id === payload.roomId);

  if (!room) {
    return;
  }

  if (room.users.includes(client.username)) {
    return;
  }

  room.users.push(client.username);

  const systemMessage = createSystemMessage(
    `${client.username} joined the room`,
  );

  room.messages.push(systemMessage);

  for (const ws of wss.clients) {
    ws.send(
      JSON.stringify({
        type: 'ROOMS_UPDATED',
        payload: {
          rooms,
        },
      }),
    );
  }
});

emmiter.on('RENAME_ROOM', ({ client, payload }) => {
  const room = rooms.find((r) => r.id === payload.roomId);

  if (!room || payload.userId !== room.creatorId) {
    return;
  }

  room.name = payload.newName;

  const systemMessage = createSystemMessage(
    `${client.username} changed the chat name to ${payload.newName}`,
  );

  room.messages.push(systemMessage);

  for (const ws of wss.clients) {
    ws.send(
      JSON.stringify({
        type: 'ROOMS_UPDATED',
        payload: {
          rooms,
        },
      }),
    );
  }
});

emmiter.on('DELETE_ROOM', ({ client, payload }) => {
  const room = rooms.find((r) => r.id === payload.roomId);

  if (!room || payload.userId !== room.creatorId) {
    return;
  }

  rooms = rooms.filter((r) => r.id !== room.id);

  for (const ws of wss.clients) {
    ws.send(
      JSON.stringify({
        type: 'ROOMS_UPDATED',
        payload: {
          rooms,
        },
      }),
    );
  }
});

emmiter.on('SEND_MESSAGE', ({ client, payload }) => {
  const room = rooms.find((r) => r.id === payload.roomId);

  if (!room) {
    return;
  }

  const message = {
    user: client.username,
    text: payload.text,
    createdAt: new Date(),
    id: Date.now(),
    type: 'user',
  };

  room.messages.push(message);

  for (const ws of wss.clients) {
    if (room.users.includes(ws.username)) {
      ws.send(
        JSON.stringify({
          type: 'ROOMS_UPDATED',
          payload: {
            rooms,
          },
        }),
      );
    }
  }
});

wss.on('connection', (client) => {
  client.on('message', (data) => {
    const message = JSON.parse(data);

    emmiter.emit(message.type, {
      client,
      payload: message.payload,
    });
  });
});
