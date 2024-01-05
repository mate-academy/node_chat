import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import connectDb from './utils/db';
import chatRoutes from './routes/chat';
import userRoutes from './routes/user';
import roomRoutes from './routes/room';
import errorHandler from './middlewares/error';
import handleSocketConnection from './utils/socket';

dotenv.config();

connectDb().then(() => {
  // eslint-disable-next-line no-console
  console.log('Database connected');
}).catch((error) => {
  // eslint-disable-next-line no-console
  console.error(`Error connecting to the database: ${error}`);
});

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/chats', chatRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);

const server = http.createServer(app);
const io = new Server(server);

io.on('connection', handleSocketConnection);

app.use(errorHandler);

server.listen(
  process.env.PORT,
  // eslint-disable-next-line no-console
  () => console.log(`Server running on port ${process.env.PORT}`),
);
