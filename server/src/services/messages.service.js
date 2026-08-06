const { getRoomById } = require('./rooms.service');

const addMessage = (roomId, author, text) => {
  const room = getRoomById(roomId);

  if (!room) {
    return;
  }

  const newMessage = {
    author,
    text,
    time: Date.now(),
  };

  room.messages.push(newMessage);

  return newMessage;
};

const getMessages = (roomId) => {
  const room = getRoomById(roomId);

  return room ? room.messages : [];
};

module.exports = {
  addMessage,
  getMessages,
};
