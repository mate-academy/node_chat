import 'dotenv/config';
import express from 'express';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import { userRouter } from './routes/user.route.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import { messageRouter } from './routes/message.route.js';
import { roomRouter } from './routes/room.route.js';

const PORT = process.env.PORT || 3005;

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: process.env.CLIENT_HOST,
    credentials: true,
  }),
);

app.use('/user', userRouter);
app.use('/rooms', roomRouter);
app.use(messageRouter);

app.use(errorMiddleware);

const server = app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running at port: ${PORT}`);
});

export const wss = new WebSocketServer({ server });

wss.on('connection', (client) => {
  console.log('New client connected');

  client.on('message', (message) => {
    const parsedMessage = JSON.parse(message);

    if (parsedMessage.type === 'join-room') {
      client.username = parsedMessage.username;
      client.roomId = parsedMessage.roomId;
      console.log(
        `Client ${client.username} connected to room ${client.roomId}`,
      );
    } else if (parsedMessage.type === 'change-room') {
      client.roomId = parsedMessage.roomId;
      console.log(`${client.username} moved to room ${client.roomId}`);
    }
  });

  client.on('close', () => {
    console.log(`Client ${client.username} disconected`);
  });
});
