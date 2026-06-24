import { EventEmitter } from 'events';
import express from 'express';
import cors from 'cors';

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(cors());

const messages = [];
const messageEmitter = new EventEmitter();

app.get('/messages', (req, res) => {
  messageEmitter.once('message', () => res.send(messages));
});

app.get('/message', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Connection', 'keep-alive');

  const callback = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  messageEmitter.on('message', callback);
  req.on('close', () => messageEmitter.off('message', callback));
});

app.post('/messages', (req, res) => {
  const message = {
    text: req.body.text,
    author: req.body.author,
    time: new Date(),
  };

  messages.push(message);
  messageEmitter.emit('message', message);
  res.status(201).json(message);
});

app.listen(PORT);
