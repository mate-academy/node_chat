const users = new Map();

function createKey(userName, roomName) {
  return `${userName}:${roomName}`; // Composite key: "userName:roomName"
}

function userJoin(userName, roomName) {
  const user = { userName, roomName };
  const key = createKey(userName, roomName);

  users.set(key, user);

  return user;
}

function getCurrentUser(userName, roomName) {
  const key = createKey(userName, roomName);

  return users.get(key);
}

function userLeave(userName, roomName) {
  const key = createKey(userName, roomName);
  const user = users.get(key);

  if (user) {
    users.delete(key);

    return user;
  }
}

function getRoomUsers(roomName) {
  return [...users.values()].filter((user) => user.roomName === roomName);
}

export const roomUsers = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
};
