import express from 'express';
import { WebSocket, WebSocketServer } from 'ws';
import cors from 'cors';
import { messageRouter } from './routes/message.route.js';
import { roomRouter } from './routes/room.router.js';
import { messageController } from './controllers/message.controller.js';

const PORT = process.env.PORT || 3005;

const app = express();

app.use(express.json());
app.use(cors());

app.use('/messages', messageRouter);
app.use('/rooms', roomRouter);

const server = app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${PORT}`);
});

const wss = new WebSocketServer({ server });

wss.on('connection', (client) => {
  client.on('message', async (data) => {
    const receivedData = JSON.parse(data.toString());
    const newMessage = receivedData.message;

    const req = {
      body: {
        author: newMessage.author,
        text: newMessage.text,
        roomId: newMessage.roomId,
      },
    };

    const res = {
      send: (response) => {
        // eslint-disable-next-line no-console
        console.log('Message created:', response);
      },
      status: (code) => {
        // eslint-disable-next-line no-console
        console.log('Status code:', code);

        return res;
      },
    };

    const createMessage = await messageController.createNewMessage(req, res);

    wss.clients.forEach((cl) => {
      if (cl.readyState === WebSocket.OPEN) {
        cl.send(JSON.stringify(createMessage));
      }
    });

    client.on('close', () => {
      // eslint-disable-next-line no-console
      console.log('Client disconnected');
    });
  });
});
