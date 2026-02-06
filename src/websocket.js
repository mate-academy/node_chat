export const rooms = {};

export function createRoom(name) {
  if (!name || rooms[name]) {
    return false;
  }

  rooms[name] = {
    name,
    users: new Set(),
    messages: [],
  };

  return true;
}

export function renameRoom(oldName, newName) {
  if (!rooms[oldName] || rooms[newName]) {
    return false;
  }

  rooms[newName] = rooms[oldName];
  rooms[newName].name = newName;
  delete rooms[oldName];

  return true;
}

export function deleteRoom(name) {
  if (!rooms[name]) {
    return false;
  }

  delete rooms[name];
  return true;
}

export function joinRoom(roomName, client) {
  if (!rooms[roomName]) {
    return false;
  }

  // remove client from all rooms
  Object.values(rooms).forEach((room) => {
    room.users.delete(client);
  });

  rooms[roomName].users.add(client);
  return true;
}
