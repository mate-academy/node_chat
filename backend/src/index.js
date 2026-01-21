import express from 'express';
import cors from 'cors';
import { EventEmitter } from 'events';
import { WebSocketServer } from 'ws';

const app = express();

app.use(cors());
app.use(express.json());

const emitter = new EventEmitter();

const rooms = {
  general: [],
};

app.post('/messages', (req, res) => {
  const { text, author, room } = req.body;

  if (!text || !author || !room) {
    return res.status(400).json({ error: 'Invalid message' });
  }

  const message = {
    author,
    room,
    text,
    time: new Date(),
  };

  rooms[room].push(message);

  emitter.emit('message', message);

  res.status(201).json(message);
});

app.get('/rooms/:room/messages', (req, res) => {
  const { room } = req.params;

  if (!rooms[room]) {
    rooms[room] = [];
  }

  res.json(rooms[room]);
});

const server = app.listen(3005, () => {
  // eslint-disable-next-line no-console
  console.log('Server running on http://localhost:3005');
});

const wss = new WebSocketServer({ server });

wss.on('connection', (connection) => {
  connection.on('message', (data) => {
    const { text, author, room } = JSON.parse(data);

    const message = {
      author,
      text,
      room,
      time: new Date(),
    };

    if (!rooms[room]) {
      rooms[room] = [];
    }

    rooms[room].push(message);

    emitter.emit('message', message);
  });
});

emitter.on('message', (message) => {
  for (const client of wss.clients) {
    client.send(JSON.stringify(message));
  }
});
