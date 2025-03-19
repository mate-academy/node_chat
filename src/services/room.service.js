const { Room } = require('../models/room.model.js');

const findRoom = (id) => {
  return Room.findByPk(id);
};

const create = ({ title, userId }) => {
  return Room.create({ title, userId });
};

const rename = async ({ id, title }) => {
  const room = await findRoom(id);

  if (!room || !title) {
    return null;
  }

  room.title = title;
  room.save();

  return room;
};

const remove = (id) => {
  return Room.destroy({ where: { id } });
};

module.exports = {
  roomService: {
    create,
    remove,
    rename,
    findRoom,
  },
};
