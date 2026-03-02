import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const rooms = { general: [] }; // одразу створюємо general

function ensureRoom(room) {
  if (!rooms[room]) rooms[room] = [];
}

function broadcast(room, data) {
  wss.clients.forEach((client) => {
    if (client.room === room && client.readyState === 1) {
      client.send(JSON.stringify(data));
    }
  });
}

app.get('/messages', (req, res) => {
  const room = req.query.room || 'general';
  res.send(rooms[room] || []);
});

app.post('/messages', (req, res) => {
  const { text, author, room = 'general' } = req.body;

  ensureRoom(room);

  const message = { text, author, time: new Date(), room };
  rooms[room].push(message);

  broadcast(room, { type: 'message', ...message });

  res.status(201).send(message);
});

app.get('/rooms', (req, res) => {
  res.send(Object.keys(rooms));
});

app.post('/rooms', (req, res) => {
  const { name } = req.body;
  ensureRoom(name);
  res.status(201).send({ name });
});

app.delete('/rooms/:name', (req, res) => {
  const { name } = req.params;

  if (!rooms[name]) {
    return res.status(404).send({ error: 'Room not found' });
  }

  delete rooms[name];

  wss.clients.forEach((client) => {
    if (client.room === name) {
      client.room = 'general';
      client.send(
        JSON.stringify({
          type: 'room_deleted',
          redirectTo: 'general',
        }),
      );
    }
  });

  res.send({ deleted: name });
});


const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const wss = new WebSocketServer({ server });

wss.on('connection', (socket) => {
  socket.room = 'general';

  socket.on('message', (data) => {
    const msg = JSON.parse(data);

    if (msg.type === 'join') {
      ensureRoom(msg.room);
      socket.room = msg.room;

      socket.send(
        JSON.stringify({
          type: 'history',
          messages: rooms[msg.room],
        }),
      );
      return;
    }

    if (msg.type === 'message') {
      const message = {
        text: msg.text,
        author: msg.author,
        time: new Date(),
        room: socket.room,
      };

      rooms[socket.room].push(message);
      broadcast(socket.room, { type: 'message', ...message });
    }
  });
});
