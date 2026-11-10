const { chats } = require('../data/store');

function getChatById(chatId) {
  return chats.find((chat) => chat.id === chatId);
}

function getChats() {
  return chats;
}

function addChat(chat) {
  chats.push(chat);
}

function updateChat(chatId, name) {
  const chat = getChatById(chatId);

  if (!chat) {
    return null;
  }

  chat.name = name;

  return chat;
}

function deleteChat(chatId) {
  const chat = getChatById(chatId);

  if (!chat) {
    return null;
  }

  const index = chats.indexOf(chat);

  chats.splice(index, 1);

  return chat;
}

module.exports = {
  getChatById,
  getChats,
  addChat,
  updateChat,
  deleteChat,
};
