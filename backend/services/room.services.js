const { Room } = require("../module");

function getAllRooms() {
  return Room.findAll();
};

function createRoom(roomname, idUser) {
  return Room.create({
    roomname,
    idUser
  });
}

function changeNameRoom(roomname, id) {
  return Room.update(
    { roomname },
    {
      where: {
        id,
      },
    },
  );
}

function getRoom(id) {
  return Room.findByPk(id);
}

function removeRoom(id) {
  return Room.destroy({ where: { id }});
}

module.exports = {
  getAllRooms,
  createRoom,
  getRoom,
  changeNameRoom,
  removeRoom
}
