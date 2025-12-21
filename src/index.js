/* eslint-disable no-console */

import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';

const PORT = process.env.PORT || 3005;

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_HOST,
    credentials: true,
  }),
);
app.use(express.json());

const messages = [];
const rooms = [];

app.post('/messages', (req, res) => {
  const { author, text, roomId } = req.body;

  const message = {
    id: uuidv4(),
    roomId,
    author,
    text,
    time: new Date(),
  };

  messages.push(message);

  broadcast({
    type: 'NEW_MESSAGE',
    payload: message,
  });

  res.status(201).send(message);
});

app.post('/room', (req, res) => {
  const { name, author } = req.body;

  if (!name.trim()) {
    res.status(400).send({ message: 'Room name cannot be empty' });
    return;
  }

  const room = {
    id: uuidv4(),
    name,
    author,
  };

  rooms.push(room);

  broadcast({
    type: 'NEW_ROOM',
    payload: room,
  });

  res.status(201).send(room);
});

app.patch('/room-update', (req, res) => {
  const { id, name } = req.body;
  const room = rooms.find((r) => r.id === id);

  if (!room) {
    return res.status(404).send({ message: 'Room not found' });
  }

  if (room) {
    room.name = name;
  }

  broadcast({
    type: 'ROOM_UPDATE',
    payload: room,
  });

  res.status(200).send(room);
});

app.delete('/delete/:id', (req, res) => {
  const { id } = req.params;
  const index = rooms.findIndex((room) => room.id === id);

  if (index === -1) {
    return res.status(404).send({ message: 'Room not found' });
  }

  const [deletedRoom] = rooms.splice(index, 1);

  broadcast({
    type: 'ROOM_DELETE',
    payload: deletedRoom,
  });

  res.sendStatus(200);
});

const server = app.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
});

const wss = new WebSocketServer({ server });

function broadcast(data) {
  const msg = JSON.stringify(data);

  for (const client of wss.clients) {
    if (data.type === 'NEW_MESSAGE') {
      if (client.roomId === data.payload.roomId) {
        client.send(msg);
      }
    } else {
      client.send(msg);
    }
  }
}

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const roomId = url.searchParams.get('roomId');

  ws.roomId = roomId;

  ws.send(
    JSON.stringify({
      type: 'INIT_MESSAGES',
      payload: messages.filter((msg) => msg.roomId === roomId),
    }),
  );

  ws.send(
    JSON.stringify({
      type: 'INIT_ROOMS',
      payload: rooms,
    }),
  );
});
