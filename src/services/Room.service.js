const { generateId } = require('../utils');

let rooms = [];

const getAll = () => {
  return rooms;
};

const buildRoom = (name) => {
  return {
    id: generateId(rooms),
    name,
  };
};

const getOneById = (id) => {
  return rooms.find((room) => room.id === +id);
};

const addOne = (room) => {
  rooms.push(room);
};

const removeOne = (id) => {
  const updatedRooms = rooms.filter((item) => +item.id !== +id);

  if (updatedRooms) {
    rooms = updatedRooms;
  }
};

const updateOne = (id, name) => {
  const room = getOneById(id);

  if (room) {
    room.name = name;

    return room;
  }
};

module.exports = {
  getAll,
  buildRoom,
  addOne,
  removeOne,
  getOneById,
  updateOne,
};
