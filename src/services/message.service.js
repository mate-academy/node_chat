import { randomUUID } from 'node:crypto';

const messages = [];

function getByRoom(roomId) {
  // eslint-disable-next-line no-return-assign
  return messages.filter((message) => message.roomId === roomId);
}

function add({ roomId, author, text }) {
  const object = {
    id: randomUUID(),
    roomId: roomId,
    author: author,
    text: text,
    time: new Date().toISOString(),
  };

  messages.push(object);

  return object;
}

function removeByRoom(roomId) {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].roomId === roomId) {
      messages.splice(i, 1);
    }
  }
}

export const messageService = {
  getByRoom,
  add,
  removeByRoom,
};
