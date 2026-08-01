'use strict';

const messageService = require('../services/message.service.js');

function register(io, socket) {
  socket.on('message:send', ({ roomId, author, text }) => {
    const message = messageService.add(roomId, { author, text });

    if (message) {
      io.to(String(roomId)).emit('message:new', { roomId, message });
    }
  });
}

module.exports = { register };
