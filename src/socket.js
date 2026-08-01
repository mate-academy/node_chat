'use strict';

const roomService = require('./services/room.service.js');
const roomHandlers = require('./handlers/room.handlers.js');
const messageHandlers = require('./handlers/message.handlers.js');

function initSocket(io) {
  io.on('connection', (socket) => {
    socket.emit('rooms:list', roomService.list());

    roomHandlers.register(io, socket);
    messageHandlers.register(io, socket);
  });
}

module.exports = { initSocket };
