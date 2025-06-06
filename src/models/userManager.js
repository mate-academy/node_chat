const users = {};

function createUser(socketId, username) {
  users[socketId] = { username, currentRoom: null };
}

function getUser(socketId) {
  return users[socketId];
}

function getUserRoom(socketId) {
  const user = users[socketId];

  return user ? user.currentRoom : null;
}

function setUserRoom(socketId, roomId) {
  if (users[socketId]) {
    users[socketId].currentRoom = roomId;

    return true;
  }

  return false;
}

function removeUser(socketId) {
  const user = users[socketId];

  if (user) {
    delete users[socketId];

    return user;
  }

  return null;
}

function userExists(socketId) {
  return !!users[socketId];
}

module.exports = {
  createUser,
  getUser,
  getUserRoom,
  setUserRoom,
  removeUser,
  userExists,
};
