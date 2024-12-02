const messages = [];
// const UserService = require('../services/User.service.js');

const buildMsg = (text, user) => {
  const time = new Intl.DateTimeFormat('pt-BR', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  }).format(new Date());

  return { text, user, time };
};

const addOne = (msg) => {
  messages.push(msg);
  messages.sort((a, b) => a.time - b.time);
};

const getAll = () => {
  return messages;
};

const getAllByRoomId = (roomId) => {
  const filteredMessages = messages.filter(
    (msg) => msg.user.currentRoomId === +roomId,
  );

  return filteredMessages;
};

module.exports = {
  getAll,
  buildMsg,
  addOne,
  getAllByRoomId,
};
