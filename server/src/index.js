import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { roomRouter } from './routes/roomRouter.js';
import { getChat } from './services/getChat.js';

const PORT = process.env.PORT || 3005;

const app = express();

app.use(cors());

app.use('/rooms', express.json(), roomRouter);

const server = app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on port ${PORT}`);
});

getChat(server);
