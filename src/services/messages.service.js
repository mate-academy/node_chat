const messages = [];

function sendMessage(username, message) {
  const newMessage = { username, message, time: new Date() };

  messages.push(newMessage);

  return newMessage;
}

export const messagesService = {
  sendMessage,
};
