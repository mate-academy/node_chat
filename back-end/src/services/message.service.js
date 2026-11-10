const { getChatById } = require('./chat.service');

function addMessage(chatId, message) {
  const chat = getChatById(chatId);

  if (!chat) {
    return null;
  }

  chat.messages.push(message);

  return message;
}

module.exports = {
  addMessage,
};
