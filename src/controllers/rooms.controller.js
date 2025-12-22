const { Room } = require('../models/Room.model');
const { User } = require('../models/User.model');

const getAll = async (req, res) => {
  const rooms = await Room.findAll();

  res.status(200).json(rooms);
};

const create = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Bad request' });
  }

  const room = await Room.create({ name });

  res.status(201).json(room);
};

const getById = async (req, res) => {
  const id = +req.params.id;
  const room = await Room.findByPk(id);

  if (!room) {
    return res.status(404).json({ error: 'Not found' });
  }

  res.status(200).json(room);
};

const remove = async (req, res) => {
  const id = +req.params.id;
  const room = await Room.findByPk(id);

  if (!room) {
    return res.status(404).json({ error: 'Not found' });
  }

  await room.destroy();
  res.sendStatus(204);
};

const update = async (req, res) => {
  const id = +req.params.id;
  const { name } = req.body;
  const room = await Room.findByPk(id);

  if (!room) {
    return res.status(404).json({ error: 'Not found' });
  }

  if (!name) {
    return res.status(400).json({ error: 'Bad request' });
  }

  await room.update({ name });
  res.status(200).json(room);
};

const join = async (req, res) => {
  const id = +req.params.id;
  const userId = req.body.userId && +req.body.userId;

  if (!userId) {
    return res.status(400).json({ error: 'Bad request' });
  }

  const room = await Room.findByPk(id);

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const user = await User.findByPk(userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const members = Array.isArray(room.members) ? room.members.slice() : [];

  if (!members.includes(userId)) {
    members.push(userId);
    await room.update({ members });
  }

  res.status(200).json(room);
};

const roomsController = {
  getAll,
  create,
  getById,
  remove,
  update,
  join,
};

module.exports = { roomsController };
