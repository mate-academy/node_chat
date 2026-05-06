import express from 'express';
import cors from 'cors';
import EventEmitter from 'events';
import { v4 as uuidv4 } from "uuid";

const app = express();

app.use(express.json());
app.use(cors());

const messages = [];

let rooms = [{
  id: 'general',
  name: 'General',
  messages: [],
}]

const emitter = new EventEmitter();

app.post('/messages', (req, res) => {
  const { text, author, roomId } = req.body;

  const date = new Date();

  const dateNormalized = `${date.getHours()}:${date.getMinutes()}`;

  const message = {
    id: uuidv4(),
    author,
    text,
    time: dateNormalized,
    roomId,
  }
  messages.push(message);

  emitter.emit('message', message);

  res.status(201).send(messages);
})

app.get('/messages', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Cache-Control', 'no-store');

  res.write(`data: ${JSON.stringify(messages)}\n\n`)
  const cb = (message) => {
    res.write(`data: ${JSON.stringify(message)}\n\n`)
  }

  emitter.on('message', cb)

  res.on('close', () => {
    emitter.off('message', cb)
  })
})

app.post('/rooms', (req, res) => {
  const { name } = req.body;

  const room = {
    id: uuidv4(),
    name,
  }
  rooms.push(room);

  emitter.emit('rooms', rooms);

  res.status(201).send(rooms);
})

app.get('/rooms', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Connection', 'keep-alive');

  res.write(`data: ${JSON.stringify(rooms)}\n\n`);
  
  const cb = (rooms) => {
    res.write(`data: ${JSON.stringify(rooms)}\n\n`)
  }
  emitter.on('rooms', cb)
  res.on('close', () => {
    emitter.off('rooms', cb)
  })
})

app.patch('/rooms/:id', (req, res) => {
  const { name } = req.body;
  const id = req.params.id;

  const room = rooms.find(room => room.id === id);

  if (!room) {
    return res.status(404);
  }

  if (id === 'general') {
    return res.status(400);
  }

  room.name = name;

  emitter.emit('rooms', rooms);

  res.json(room);
})

app.delete('/rooms/:id', (req, res) => {
  const id = req.params.id;

  const room = rooms.find(room => room.id === id);

  if (!room) {
    return res.status(404);
  }

  if (id === 'general') {
    return res.status(400);
  }

  rooms = rooms.filter(room => room.id !== id);

  emitter.emit('rooms', rooms);

  res.status(200);
})

app.listen(3005, () => {
  console.log('Server is running on 3005');
});
