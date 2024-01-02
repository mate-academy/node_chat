'use strict';

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const connectDb = require('./utils/db');
const chatRoutes = require('./routes/chat');
const userRoutes = require('./routes/user');
const roomRoutes = require('./routes/room');
const errorHandler = require('./middlewares/error');
const handleSocketConnection = require('./utils/socket');

connectDb();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/chats', chatRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);

const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', handleSocketConnection);

// Error handling middleware
app.use(errorHandler);

server.listen(
  process.env.PORT,
  // eslint-disable-next-line no-console
  () => console.log(`Server running on port ${process.env.PORT}`));
