const messages = [];

function getMessagesByGroupId(groupId) {
  return messages.filter((message) => message.groupId === groupId);
}

function sendMessage(username, message, groupId = null) {
  const newMessage = {
    username,
    message,
    time: new Date(),
    groupId,
  };

  messages.push(newMessage);

  return newMessage;
}

module.exports = {
  getMessagesByGroupId,
  sendMessage,
};
