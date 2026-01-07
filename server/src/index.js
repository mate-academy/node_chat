import express from 'express';
import cors from 'cors';
import 'dotenv/config.js';
import { roomsRouter } from './routes/rooms.route.js';
import { messagesRouter } from './routes/messages.route.js';
import { errorMiddleware } from './middlewares/error.middleware.js';

const PORT = process.env.PORT || 3005;

export const sendEvent = (data) => {
  clients
    .filter((client) => client.roomId === data.roomId) // roomId на верхньому рівні
    .forEach((client) => {
      client.res.write(`data: ${JSON.stringify(data)}\n\n`);
    });
};

const app = express();
app.use(cors());
app.use(express.json());

// Роути
app.use(roomsRouter);
app.use(messagesRouter);

// SSE для кімнат
let clients = [];

app.get('/events', (req, res) => {
  const { roomId } = req.query;
  if (!roomId) return res.sendStatus(400);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const clientId = Date.now().toString();
  const newClient = { id: clientId, res, roomId };
  clients.push(newClient);

  req.on('close', () => {
    clients = clients.filter((c) => c.id !== clientId);
  });
});

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
