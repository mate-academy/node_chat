const MessageService = require('../services/Message.service.js');
const { errorHandler } = require('../utils.js');

module.exports = (io, socket) => {
  const sendMessage = (data) => {
    const message = MessageService.buildMsg(data.text, data.user);
    const currentRoom = message.user.currentRoom?.name;

    MessageService.addOne(message);
    io.to(currentRoom).emit('message', message);
  };

  socket.on('sendMessage', errorHandler(sendMessage));
};
