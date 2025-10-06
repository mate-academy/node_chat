const rooms = {
  general: { name: 'General', messages: [] },
  tech: { name: 'Technology', messages: [] },
  random: { name: 'Random', messages: [] },
};

function getAllRooms() {
  return rooms;
}

function getRoomsList() {
  return Object.entries(rooms).map(([id, data]) => ({ id, name: data.name }));
}

function getRoom(roomId) {
  return rooms[roomId];
}

function createRoom(roomName) {
  const roomId = `room_${Date.now()}`;

  rooms[roomId] = { name: roomName, messages: [] };

  return roomId;
}

function renameRoom(roomId, newName) {
  if (rooms[roomId]) {
    rooms[roomId].name = newName;

    return true;
  }

  return false;
}

function deleteRoom(roomId) {
  if (rooms[roomId] && roomId !== 'general') {
    delete rooms[roomId];

    return true;
  }

  return false;
}

function addMessage(roomId, message) {
  if (rooms[roomId]) {
    rooms[roomId].messages.push(message);

    return true;
  }

  return false;
}

function roomExists(roomId) {
  return !!rooms[roomId];
}

module.exports = {
  getAllRooms,
  getRoomsList,
  getRoom,
  createRoom,
  renameRoom,
  deleteRoom,
  addMessage,
  roomExists,
};
