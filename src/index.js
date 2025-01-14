'use strict';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import { roomRoute } from './routes/room.route.js';
import { messageRoute } from './routes/messageRoute.js';

const PORT = process.env.PORT || 3005;

const app = express();

app.use(express.json());
app.use(cors());

app.use('/rooms', roomRoute);
app.use('/messages', messageRoute);

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
