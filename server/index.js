import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { processClientMessage } from './ws-handlers.js';

const PORT = process.env.PORT || 3005;

const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const server = app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(
    `\x1b[32m[READY]\x1b[0m Server is running on \x1b[36mhttp://localhost:${PORT}\x1b[0m`,
  );
});

const wss = new WebSocketServer({ server });

wss.on('connection', (client) => {
  // eslint-disable-next-line no-console
  console.log('A new client connected');

  client.on('message', (data) => {
    processClientMessage(data, client, wss);
    // eslint-disable-next-line no-console
    console.log(`Received data: ${data}`);
  });
});
