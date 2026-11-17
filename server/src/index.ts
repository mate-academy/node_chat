import 'reflect-metadata';
import 'dotenv/config';
import http from 'http';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import { AppDataSource } from './data-source';
import { usersRouter } from './routes/users';
import { roomsRouter } from './routes/rooms';
import { initSocket } from './socket';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', async (_req, res) => {
  const result = await AppDataSource.query('SELECT NOW() AS now');
  res.json({ status: 'ok', dbTime: result[0].now });
});

app.use('/users', usersRouter);

app.use('/rooms', roomsRouter);

// Catches anything thrown inside route handlers
app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
});

async function main() {
  await AppDataSource.initialize();
  console.log('Database connected');

  const httpServer = http.createServer(app);

  initSocket(httpServer);

  const port = Number(process.env.PORT) || 3001;
  httpServer.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
