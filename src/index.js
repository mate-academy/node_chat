/* eslint-disable no-console */
import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import { userRouter } from './routers/userRouter.js';
import { WebSocket, WebSocketServer } from 'ws';
import http from 'http';

const createServer = () => {
  const app = express();

  app.use(
    cors({
      origin: process.env.CLIENT_HOST || 'http://localhost:3000',
      credentials: true,
    }),
  );

  app.use(express.json());
  app.use(userRouter);

  app.use((req, res, next) => {
    res.status(404).send({ message: 'Page Not Found' });
  });

  const server = http.createServer(app);

  const wss = new WebSocketServer({ server });

  wss.on('connection', (socket) => {
    console.log('New Client Connected');

    socket.on('message', (message) => {
      console.log(`Recieved message ${message}`);

      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message.toString());
        }
      });
    });

    socket.on('close', () => {
      console.log('Client has disconnected');
    });
  });

  return server;
};

const PORT = process.env.PORT || 7070;

createServer().listen(PORT, () => {
  console.log(`Server is running on localhost:${PORT}`);
});
