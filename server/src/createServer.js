import express from 'express';
import cors from 'cors';
import { router as roomsRouter } from './routes/room.route.js';

export function createServer() {
  const app = express();

  app.use(express.json());
  app.use(cors());

  app.use('/rooms', roomsRouter);

  const PORT = process.env.PORT || 3005;
  const server = app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server is listening on port: http://localhost:${PORT}`);
  });

  return server;
}
