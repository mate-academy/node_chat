const { Room } = require('../models/Room.model');
const { Message } = require('../models/Message.model');
const { eventEmitter } = require('../utils/sockets');
const getAll = async (req, res) => {
  const rooms = await Room.findAll();

  res.send(rooms);
};

const create = async (req, res) => {
  const { name } = req.body;
  const room = await Room.create({ name });
  eventEmitter.emit('addRoom', room);

  res.send(room);
};

const update = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  await Room.update({ name }, { where: { id } });
  eventEmitter.emit('updateRoom', { id, name });

  res.send({ id, name });
};

const deleteRoom = async (req, res) => {
  const { id } = req.params;

  eventEmitter.emit('removeRoom', id);

  await Room.destroy({ where: { id } });
  await Message.destroy({ where: { chat_id: id } });
};

module.exports = {
  roomsController: {
    getAll,
    create,
    update,
    deleteRoom,
  },
};
