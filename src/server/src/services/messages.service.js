const messages = [];

function getAllMessages() {
  return true;
}

async function updateMessage(message) {
  messages.push(message);
}

export const messagesService = {
  getAllMessages,
  updateMessage,
};
