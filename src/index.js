'use strict';

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { userRouter } from './routes/user.route.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import { roomsRouter } from './routes/rooms.route.js';
import { messageRouter } from './routes/message.route.js';
import { emmiter } from './utils/emmiter.js';
import cookieParser from 'cookie-parser';
import { refreshRouter } from './routes/refresh.route.js';

const PORT = process.env.PORT || 3005;

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use('/user', userRouter);
app.use('/rooms', roomsRouter);
app.use('/messages', messageRouter);
app.use('/refresh', refreshRouter);

app.use(errorMiddleware);

const server = app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log('server is running');
});

const wss = new WebSocketServer({ server });

emmiter.on('message', (message) => {
  for (const client of wss.clients) {
    client.send(JSON.stringify(message));
  }
});
