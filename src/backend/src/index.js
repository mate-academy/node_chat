import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { EventEmitter } from 'events';
import { v7 as uuid7 } from 'uuid';
import { systemMessage } from './utils/systemMessage.js';

const app = express();

app.use(cors());
app.use(express.json());

let rooms = [];

const server = app.listen(3007);
const wss = new WebSocketServer({ server });
const emitter = new EventEmitter();

emitter.on('SET_USERNAME', ({ connection, payload }) => {
  connection.userName = payload.userName;

  connection.send(
    JSON.stringify({
      type: 'ROOMS_UPDATED',
      payload: {
        rooms,
      },
    }),
  );
});

emitter.on('CREATE_ROOM', ({ connection, payload }) => {
  const id = uuid7();
  const newRoom = {
    roomName: payload.roomName,
    creatorId: payload.creatorId,
    messages: [],
    users: [connection.userName],
    id,
  };

  rooms.unshift(newRoom);

  wss.clients.forEach((ws) => {
    ws.send(
      JSON.stringify({
        type: 'ROOMS_UPDATED',
        payload: { rooms },
      }),
    );
  });

  connection.send(
    JSON.stringify({
      type: 'CREATED_ROOM',
      payload: {
        newRoom,
      },
    }),
  );
});

emitter.on('JOIN_ROOM', ({ connection, payload }) => {
  const room = rooms.find((chat) => chat.id === payload.roomId);

  if (!room || room.users.includes(connection.userName)) {
    return;
  }

  room.users.push(connection.userName);

  const message = systemMessage(`${connection.userName} joined the room`);

  room.messages.push(message);

  wss.clients.forEach((ws) => {
    ws.send(
      JSON.stringify({
        type: 'ROOMS_UPDATED',
        payload: { rooms },
      }),
    );
  });
});

emitter.on('SEND_MESSAGE', ({ connection, payload }) => {
  const room = rooms.find((chat) => chat.id === payload.roomId);

  if (!room) {
    return;
  }

  const message = {
    id: uuid7(),
    text: payload.text,
    user: connection.userName,
    createAt: new Date(),
    type: 'user',
  };

  room.messages.push(message);

  wss.clients.forEach((ws) => {
    if (room.users.includes(ws.userName)) {
      ws.send(
        JSON.stringify({
          type: 'ROOMS_UPDATED',
          payload: { rooms },
        }),
      );
    }
  });
});

emitter.on('NEWNAME_ROOM', ({ connection, payload }) => {
  const room = rooms.find((item) => item.id === payload.roomId);

  if (!room || room.creatorId !== payload.userId) {
    return;
  }

  const message = systemMessage(
    `${connection.userName} changed the name room to ${payload.newName}`,
  );

  room.roomName = payload.newName;
  room.messages.push(message);

  wss.clients.forEach((ws) => {
    ws.send(
      JSON.stringify({
        type: 'ROOMS_UPDATED',
        payload: {
          rooms,
        },
      }),
    );
  });
});

emitter.on('DELETE_ROOM', ({ connection, payload }) => {
  const room = rooms.find((item) => item.id === payload.roomId);

  if (!room || payload.userId !== room.creatorId) {
    return;
  }

  rooms = rooms.filter((item) => item.id !== payload.roomId);

  wss.clients.forEach((ws) => {
    ws.send(
      JSON.stringify({
        type: 'ROOMS_UPDATED',
        payload: {
          rooms,
        },
      }),
    );
  });
});

wss.on('connection', (connection) => {
  connection.on('message', (data) => {
    const message = JSON.parse(data);

    emitter.emit(message.type, {
      connection,
      payload: message.payload,
    });
  });
});
