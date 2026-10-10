'use strict';

const { Server } = require('socket.io');
const chatController = require('./controllers/chatController');

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*', // Allow all origins for development..
      methods: ['GET', 'POST'],
    },
  });

  // Pass the io instance to your controller
  chatController(io);

  return io;
};

module.exports = initSocket;
