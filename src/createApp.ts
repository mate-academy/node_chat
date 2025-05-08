import cors from 'cors';
import express, { Express } from 'express';

import { authRoute } from './routes/auth.route';
import { roomRoute } from './routes/room.route';

import { errorMiddleware } from './middlewares/error.middleware';

const CLIENT_URL = process.env.CLIENT_URL;

export function createApp(): Express {
  const app = express();

  app.use(
    cors({
      methods: ['POST', 'PATCH', 'DELETE'],
      credentials: true,
      origin: CLIENT_URL,
    }),
  );

  app.use(express.json());

  app.use('/api/auth', authRoute);
  app.use('/api/rooms', roomRoute);

  app.use(errorMiddleware);

  return app;
}
