import { messages } from '../storage/storage.js';

export function sendMessageToRoom(username, text, room, isSystem = false) {
  const date = new Date().toISOString();

  const messageData = {
    username,
    date,
    text,
    isSystem,
  };

  if (messages[room]) {
    messages[room].push(messageData);
  }

  return messageData;
}
