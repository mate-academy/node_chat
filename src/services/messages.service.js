const messages = [];

function sendMessage(username, message) {
  const newMessage = { username, message, time: new Date() };

  messages.push(newMessage);

  return newMessage;
}

module.exports = {
  sendMessage,
};
