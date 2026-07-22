import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.router.js';
import { userRouter } from './routes/user.router.js';
import { createWebSocket } from './webSocket/webSocket.js';
import { roomRouter } from './routes/room.router.js';
import { messageRouter } from './routes/message.router.js';

const app = express();

app.use(cors());

app.use(express.json());

app.use('/auth', authRouter);

app.use('/user', userRouter);

app.use('/room', roomRouter);
app.use('/message', messageRouter);

export const expressServer = app.listen(3005, () => {
  console.log('Server is listen in 3005 port');
});

createWebSocket(expressServer);
