const { Room } = require('./../models/Room.model.js');
const { Message } = require('./../models/Message.model.js');
const { User } = require('./../models/User.model.js')

const createRoom = async ({ name, owner }) => {
  if (!name || !owner) {
    throw new Error('data is required');
  }

  const createdRoom = await Room.create({ name, owner });

  return createdRoom;
};

const getAllRooms = () => {
  return Room.findAll();
};

const getRoom = async (id) => {
  const room = await Room.findByPk(id);

  return room;
};

const renameRoom = async ({ id, newName }) => {
  if (!id || !newName) {
    throw new Error('data is required');
  }

  await Room.update({ name: newName }, { where: { id }});
  const room = await Room.findByPk(id)

  if (!room) {
    throw new Error('Room with this id does not exist');
  }

  return room;
};

const joinRoom = async ({ roomId }) => {
  if (!roomId) {
    throw new Error('data is required');
  }

  const room = await Room.findByPk(roomId, {
    include: [
      {
        model: Message,
        include: [User],
      },
    ],
  });

  if (!room) {
    throw new Error('Room with this id does not exist');
  }

  return room;
};

const deleteRoom = async ({ id }) => {
  if (!id) {
    throw new Error('data is required');
  }

  const deletedRoom = await Room.destroy({ where: { id} });

  if (!deletedRoom) {
    throw new Error('Room with this id does not exist');
  }
};


module.exports = {
  createRoom,
  getAllRooms,
  getRoom,
  renameRoom,
  joinRoom,
  deleteRoom,
}
