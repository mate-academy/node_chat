export const rooms = {};

export function createRoom(name) {
  if (rooms[name]) {
    return false;
  }

  rooms[name] = {
    name,
    users: new Set(),
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

  for (const room of Object.values(rooms)) {
    room.users.delete(client);
  }

  rooms[roomName].users.add(client);

  return true;
}
