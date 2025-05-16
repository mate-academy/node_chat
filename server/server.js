/* eslint-disable */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // Your frontend URL
    methods: ['GET', 'POST'],
  },
});

const rooms = {}; // Stores room names and messages

const cors = require('cors');

app.use(
  cors({
    origin: 'http://localhost:3000', // Replace with your frontend URL
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files from the public directory
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  );
  next();
});

app.get('/', (req, res) => {
  res.send('Server is running!');
});

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('setUsername', (username) => {
    socket.username = username;
  });

  socket.on('joinRoom', (room) => {
    socket.join(room);

    if (!rooms[room]) {
      rooms[room] = [];
    }
    socket.emit('loadMessages', rooms[room]); // Send previous messages
  });

  socket.on('sendMessage', ({ room, message }) => {
    const msg = { author: socket.username, time: new Date(), text: message };

    rooms[room].push(msg);
    io.to(room).emit('newMessage', msg); // Broadcast to room
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(3000, () => console.log('Server running on port 3000'));
