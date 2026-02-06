export function createRoom(name) {
  if (rooms[name]) {
    return false;
  }

  rooms[name] = {
    name,
    users: new Set(),
    messages: [], // 👈 HISTORY
  };

  return true;
}
