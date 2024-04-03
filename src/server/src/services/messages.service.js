const messages = [];

async function updateMessage(message) {
  messages.push(message);
}

export const messagesService = {
  updateMessage,
};
