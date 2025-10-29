'use strict';

import express from 'express';
import cors from 'cors';
import { authRouter } from './routers/authRouter.js';
import cookieParser from 'cookie-parser';
import { roomRouter } from './routers/roomRouter.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import { messageRouter } from './routers/messageRouter.js';

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  }),
);

app.get('/', (req, res) => {
  res.send('hello');
});

app.use('/auth', authRouter);
app.use('/rooms', roomRouter);
app.use('/messages', messageRouter);

app.use(errorMiddleware);

app.listen(3005, () => {
  /*   console.log(`http://localhost:3005`); */
});
