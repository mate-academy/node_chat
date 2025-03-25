const rooms = {}; // { roomName: [{ author, time, text }] }

const createRoom = (room) => {
  if (!rooms[room]) {
    rooms[room] = [];
  }
};

const renameRoom = (oldRoom, newRoom) => {
  if (rooms[oldRoom]) {
    rooms[newRoom] = [...rooms[oldRoom]];
    delete rooms[oldRoom];
  }
};

const deleteRoom = (room) => {
  delete rooms[room];
};

const addMessage = (room, message) => {
  if (rooms[room]) {
    rooms[room].push(message);
  }
};

const getMessages = (room) => {
  return rooms[room] || [];
};

export { createRoom, renameRoom, deleteRoom, addMessage, getMessages };
