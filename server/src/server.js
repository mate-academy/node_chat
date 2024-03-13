'use strict';

import express from 'express';
import cors from 'cors';

import { router as roomRouter } from './routers/room.router.js';
import { router as messageRouter } from './routers/message.router.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';

const app = express();
const PORT = process.env.CHAT_PORT || 3005;

app.use(cors());
app.use(express.json());

app.use('/rooms', roomRouter);
app.use('/messages', messageRouter);

app.use(errorMiddleware);

export const server = app.listen(PORT, () => {
  console.info(`ChatServer http://localhost:${PORT} is running`);
});
