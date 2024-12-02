const { generateId } = require('../utils.js');
let users = [];

const getOneById = (id) => {
  return users.find((usr) => usr.id === +id);
};

const updateCurrentRoom = (userId, roomId) => {
  const user = getOneById(userId);

  if (user) {
    user.currentRoomId = +roomId;

    return user;
  }
};

const removeOne = (id) => {
  users = users.filter((usr) => usr.id !== +id);
};

const addOne = (user) => {
  users.push(user);
};

const buildUser = (username) => {
  return {
    id: generateId(users),
    username,
    currentRoomId: null,
  };
};

const getAll = () => {
  return users;
};

const getAllByRoomId = (roomId) => {
  return users.filter((usr) => usr.currentRoomId === +roomId) || [];
};

module.exports = {
  updateCurrentRoom,
  getOneById,
  removeOne,
  addOne,
  buildUser,
  getAll,
  getAllByRoomId,
};
