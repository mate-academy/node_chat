'use strict';

const { User } = require('../sql_structure/user.model');
const { Room } = require('../sql_structure/room.model');
const { Message } = require('../sql_structure/message.model');
const { emitter } = require('./emmiter');
const normalizeUser = ({ name }) => ({ name });

const login = async (req, res, next) => {
  try {
    const name = (req.body?.name || '').trim();

    if (!name) {
      return res.status(400).send('name is not typed');
    }

    const existingUser = await User.findOne({ where: { name: name } });

    if (!existingUser) {
      const user = await User.create({ name });

      res.status(201).send({ user: normalizeUser(user) });

      return;
    }

    res.status(201).send({ user: normalizeUser(existingUser) });
  } catch (err) {
    next(err);
  }
};

const CreatingRoom = async (req, res, next) => {
  try {
    const Roomname = (req.body?.Roomname || '').trim();

    if (!Roomname) {
      return res.status(400).send('name is not typed');
    }

    const user = await Room.create({ name: Roomname });

    emitter.emit('room:created', user.toJSON());

    res.status(201).send({ Room: normalizeUser(user) });
  } catch (err) {
    next(err);
  }
};

const GETRoom = async (req, res, next) => {
  try {
    const ArrayRoom = await Room.findAll({ order: [['id', 'ASC']] });

    res.status(200).send(ArrayRoom);
  } catch (err) {
    next(err);
  }
};

const deleteRoom = async (req, res, next) => {
  try {
    const roomId = req.body?.id || 0;

    const room = await Room.findByPk(roomId);

    if (!room) {
      return res.status(404).send({ errors: 'room not found' });
    }

    await room.destroy();

    emitter.emit('room:deleted', { id: roomId });

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

const PatchRoom = async (req, res, next) => {
  try {
    const { id, name } = req.body || {};

    const NewName = name.trim();

    const room = await Room.findByPk(id);

    if (!room) {
      return res.status(404).send({ errors: 'room not found' });
    }

    await room.update({ name: NewName });

    emitter.emit('room:updated', room.toJSON());

    res.send(room);
  } catch (err) {
    next(err);
  }
};

const CreateMessage = async (req, res, next) => {
  try {
    const { username, text, roomId } = req.body || {};

    const trimmedtext = text.trim();

    if (!trimmedtext) {
      return res.status(400).send({ errors: 'you need to write message' });
    }

    const user = await User.findOne({ where: { name: username } });

    if (!user) {
      return res.status(404).send({ errors: 'User not found' });
    }

    const sendmess = await Message.create({
      text: trimmedtext,
      userId: user.id,
      username: username,
      roomId: roomId,
    });

    emitter.emit('message', sendmess.toJSON());

    res.status(201).send(sendmess);
  } catch (err) {
    next(err);
  }
};

const GETMessages = async (req, res, next) => {
  try {
    const roomId = Number(req.query.roomId);

    const messages = await Message.findAll({
      where: { roomId },
      order: [['id', 'ASC']],
    });

    res.status(200).send(messages);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  login,
  CreatingRoom,
  GETRoom,
  deleteRoom,
  PatchRoom,
  CreateMessage,
  GETMessages,
};
