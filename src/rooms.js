const roomMap = new Map(); // Map { roomName => [{ author, time, text }] }

const createRoom = (room) => {
  if (!roomMap.has(room)) {
    roomMap.set(room, []);
  }
};

const renameRoom = (oldRoom, newRoom) => {
  if (roomMap.has(oldRoom)) {
    roomMap.set(newRoom, roomMap.get(oldRoom));
    roomMap.delete(oldRoom);
  }
};

const deleteRoom = (room) => {
  roomMap.delete(room);
};

const addMessage = (room, message) => {
  if (roomMap.has(room)) {
    roomMap.get(room).push(message);
  }
};

const getMessages = (room) => {
  return roomMap.get(room) || [];
};

export { createRoom, renameRoom, deleteRoom, addMessage, getMessages };
