'use strict';

import express from 'express';
import cors from 'cors';

import 'dotenv/config';
import { roomRouter } from './routes/room.route';

const PORT = process.env.PORT || 3005;
const app = express();

app.use(express.json());
app.use(cors());

app.use('/message', messageRouter);
app.use('/room', roomRouter);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running at http://localhost:${PORT}`);
});
