import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'node:http';

import { client } from './utils/db.js';
import { roomsRouter } from './routers/roomsRouter.js';
import { initRealtime } from './realtime.js';

const PORT = process.env.PORT || 3005;
const app = express();
const server = createServer(app);

app.use(cors());
app.use(express.json());

app.use('/room', roomsRouter);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON' });
  }

  if (error.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Request body too large' });
  }

  if (error.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(409).json({
      message: 'Related record no longer exists',
    });
  }

  console.error(error);

  return res.status(500).json({ message: 'Internal server error' });
});

async function start() {
  try {
    await client.authenticate();
    console.info('PostgreSQL connected');

    initRealtime(server);

    server.listen(PORT, () => {
      console.info(`Server running at http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exitCode = 1;

    await client.close();
  }
}

start();
