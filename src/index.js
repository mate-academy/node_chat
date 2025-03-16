import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { messageRouter } from './routes/message.route';
import { roomRouter } from './routes/room.route';

const app = express();

app.use(express.json());
app.use(cors);
app.use('/message', messageRouter);
app.use('/room', roomRouter);

app.listen(process.env.PORT);
