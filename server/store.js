import nodeCrypto from 'node:crypto';

const roomState = {};

function addRoom(name) {
  const id = nodeCrypto.randomUUID();

  roomState[id] = { name, messages: [] };

  return id;
}

function getRooms() {
  return roomState;
}

function deleteRoom(id) {
  delete roomState[id];
}

function renameRoom(id, name) {
  roomState[id].name = name;
}

function addMessage(id, message) {
  const idMessage = nodeCrypto.randomUUID();
  const timestamp = new Date().toISOString();

  roomState[id].messages.push({
    id: idMessage,
    time: timestamp,
    ...message,
  });
}

export const roomActions = {
  addRoom,
  getRooms,
  deleteRoom,
  renameRoom,
  addMessage,
};
