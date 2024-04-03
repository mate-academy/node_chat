// eslint-disable-next-line no-console
import 'dotenv/config';
import cors from 'cors';
import { EventEmitter } from 'events';
import express from 'express';
import WebSocket, { WebSocketServer } from 'ws';
import { errorMiddleware } from './middlewares/errorMiddleWare.js';
import { messagesRouter } from './routes/messages.route.js';

const PORT = process.env.PORT;

const app = express();

app.use(express.json());
app.use(cors());
app.use(errorMiddleware);
app.use('/messages', messagesRouter);

app.use((req, res) => {
  res.status(404).send('Error 404: Page not found');
});

const server = app.listen(PORT);
const wss = new WebSocketServer({ server });

export const emitter = new EventEmitter();

const roomMessages = {};

wss.on('connection', (socket) => {
  socket.on('message', (message) => {
    const data = JSON.parse(message);

    if (data.type === 'join') {
      socket.room = data.room;
      const room = data.room;
      if (roomMessages[room]) {
        for (const message of roomMessages[room]) {
          socket.send(JSON.stringify({ text: message }));
        }
      }
    }
  });
});

emitter.on('message', (data) => {
  const { room, text } = data;

  if (!roomMessages[room]) {
    roomMessages[room] = [];
  }
  roomMessages[room].push(text);

  for (const client of wss.clients) {
    if (client.room === room) {
      client.send(JSON.stringify(data));
    }
  }
});
