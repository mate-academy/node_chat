'use strict';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { Console } from './utils/Console.js';
import { authRouter } from './routes/authRouter.js';
import cookieParser from 'cookie-parser';
import { chatRouter } from './routes/chatRouter.js';
import { WebSocketServer } from 'ws';
// import { EventEmitter } from 'events';
// import { chatService } from './service/chat.service.js';

const PORT = process.env.PORT || 3005;
const app = express();
// const emitter = new EventEmitter();

app.use(
  cors({
    origin: process.env.CLIENT_HOST,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('Welcome');
});

app.use('/auth', authRouter);
app.use('/chat', chatRouter);

const server = app.listen(PORT, () => {
  Console.log(`Server is running ${PORT}`);
});

export const wss = new WebSocketServer({ server });

// wss.on('connection', (connection) => {
//   connection.on('message', async (text) => {
//     await chatService.sendMessages(text);

// console.log('test')

//     emitter.emit('message', text);
//   });
// });

// wss.on('message', (message) => {
//   for (const client of wss.clients) {

//     console.log(client);

//     client.send(JSON.stringify(message));
//   }
// });

// app.post('/messages', (req, res) => {
//   const { text } = req.body;

//   const message = {
//     text,
//   }

//   message.push(message);

//   emitter.emit('message', message);

//   res.status(201).send(message);
// });

// app.get('/messages', (req, res) => {
//   emitter.on('message', (message) => {
//     res.status(200).send(message);
//   });
// })
