import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { authRouter } from './routes/auth.route.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import { roomRouter } from './routes/room.route.js';
import { WebSocketServer } from 'ws';
import { messageRouter } from './routes/message.route.js';
import './events/messageListener.js';

const PORT = process.env.PORT || 3000;

const app = express();

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use(authRouter);
app.use(roomRouter);
app.use(messageRouter);

app.get('/', (req, res) => {
  res.send('Hello');
});

app.use(errorMiddleware);

const server = app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log('Server is running...');
});

export const wss = new WebSocketServer({ server });
