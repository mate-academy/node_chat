'use strict';

import express from 'express';
import cors from 'cors';
import { authRouter } from './routers/auth.router.js';
import { userRouter } from './routers/user.router.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import { roomRouter } from './routers/rooms.js';
import { messageRouter } from './routers/messages.router.js';

const { CLIENT_URL, CLIENT_PORT } = process.env;

export function createServer() {
  const app = express();

  app.use(cookieParser());

  app.use(
    cors({
      origin: `${CLIENT_URL}${CLIENT_PORT}`,
      credentials: true,
    })
  );
  app.use(express.json());

  app.use('/api/', authRouter);

  app.use('/api/user/', userRouter);

  app.use('/api/rooms/', roomRouter);

  app.use('/api/messages/', messageRouter);

  app.use(errorMiddleware);

  return app;
}
