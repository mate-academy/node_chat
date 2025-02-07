import 'dotenv/config.js';
import express from 'express';
import { createServer } from 'node:http';
import mongoose from 'mongoose';
import SocketService from './services/socket.service.js';
import roomRoute from './routes/room.route.js';
import messageRoute from './routes/message.route.js';

const app = express();
const server = createServer(app);

SocketService.getInstance(server).getSocket();

app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', 'src/views');

app.use('/api/rooms', roomRoute);
app.use('/api/messages', messageRoute);

app.get('/', (req, res) => {
  res.render('index');
});

app.use((_req, res) => {
  res.status(404).send({ message: 'Not found' });
});

app.use((err, _req, res) => {
  console.error(err);
  res.status(500).send({ message: 'Something went wrong' });
});

mongoose.connect(process.env.MONGODB_URI);

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
