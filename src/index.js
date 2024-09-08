import express from 'express';
import { messagesRoute } from './routes/messages.route.js';
import WebSocketServer from 'wss';
import { websocketEmitter } from './websocket.js';

const app = express();

app.use(express.json());

app.use(messagesRoute);

app.get('/', (req, res) => {
  res.send('hello');
});

const server = app.listen(3005);

const wss = new WebSocketServer({ server });

websocketEmitter.on('newMessage', (message) => {
  for (const client of wss.clients) {
    client.send(JSON.stringify(message));
  }
});
