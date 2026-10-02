'use strict';

let messages = [
  {
    messageId: 'm1',
    roomId: '1',
    author: 'Anna',
    content: 'Привіт усім!',
    timestamp: Date.now() - 60000,
  },
  {
    messageId: 'm2',
    roomId: '1',
    author: 'Vasyl',
    content: 'Привіт!',
    timestamp: Date.now() - 30000,
  },
];

const getByRoomId = (roomId) => {
  const roomMessages = messages.filter((message) => message.roomId === roomId);

  return roomMessages;
};

const createMessage = (roomId, author, content) => {
  const newMessage = {
    messageId: crypto.randomUUID(),
    roomId,
    author,
    content,
    timestamp: Date.now(),
  };

  messages.push(newMessage);

  return newMessage;
};

const removeMessages = (roomId) => {
  const removedMes = messages.filter((message) => message.roomId !== roomId);

  if (messages.length === removedMes.length) {
    return false;
  }

  messages = removedMes;

  return true;
};

module.exports = {
  getByRoomId,
  createMessage,
  removeMessages,
};
