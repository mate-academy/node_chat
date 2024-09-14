/* eslint-disable no-console */
'use strict';
import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import { messageRouter } from './routes/message.route.js';
import { roomRouter } from './routes/room.route.js';
import { WebSocket, WebSocketServer } from 'ws';
import { message } from './controllers/message.js';

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(cors());

app.use(roomRouter);
app.use(messageRouter);

app.get('/', (req, res) => {
  res.send('Hello');
});

const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

const wss = new WebSocketServer({ server });

wss.on('connection', (client) => {
  console.log('Client connected');

  client.on('message', async (data) => {
    const receivedData = JSON.parse(data.toString());

    console.log(receivedData);

    const newMessage = receivedData.message;
    const createdMessage = await message.createMessage(
      newMessage.author,
      newMessage.text,
      newMessage.roomId,
    );

    console.log(createdMessage);

    wss.clients.forEach((cl) => {
      if (cl.readyState === WebSocket.OPEN) {
        cl.send(JSON.stringify(createdMessage));
      }
    });
  });

  client.on('close', () => {
    console.log('Client disconnected');
  });
});
