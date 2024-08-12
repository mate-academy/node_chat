import 'dotenv/config';
import express from 'express';
import Cors from 'cors';
import { WebSocketServer } from 'ws';
import { EventEmitter } from 'events';

import { router as userRouter} from './routes/userRout.js';
import { router as roomRouter} from './routes/roomRout.js';
import { router as messageRouter} from './routes/messageRout.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';

const PORT = process.env.PORT || 3005;
export const emmiter = new EventEmitter();

const app = express();

app.use(
  Cors({
    origin: process.env.CLIENT_HOST,
    credentials: true,
  }),
);

app.use('/', userRouter);
app.use('/', roomRouter);
app.use('/', messageRouter);


app.use(errorMiddleware);

const server = app.listen(PORT, () => {
  console.log('server is running');
});

export const wss = new WebSocketServer({ server });

wss.on('connection', (client) => {
  console.log('A new client connected');
});

emmiter.on('message', (data) => {
  for (const client of wss.clients) {
    client.send(JSON.stringify(data));
  }
});