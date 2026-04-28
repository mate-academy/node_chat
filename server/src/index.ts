import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { emitter } from './models/store.js';
import usersRouter from './routes/users.js';
import roomsRouter from './routes/rooms.js';
import messagesRouter from './routes/messages.js';

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(cors());

app.use('/users', usersRouter);
app.use('/rooms', roomsRouter);
app.use('/messages', messagesRouter);

const server = app.listen(PORT);

const wss = new WebSocketServer({ server });

emitter.on('message', (data) => {
  for (const client of wss.clients) {
    client.send(JSON.stringify(data));
  }
});
