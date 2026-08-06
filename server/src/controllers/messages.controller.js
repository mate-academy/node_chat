const { addMessage } = require('../services/messages.service');

const registerMessagesController = (io, socket) => {
  socket.on('send message', (text) => {
    const username = socket.data.username;
    const roomId = socket.data.roomId;

    if (!username || !roomId) {
      return;
    }

    if (typeof text !== 'string' || text.trim() === '') {
      return;
    }

    const newMessage = addMessage(roomId, username, text.trim());

    if (!newMessage) {
      return;
    }

    io.to(roomId).emit('new message', newMessage);
  });
};

module.exports = {
  registerMessagesController,
};
