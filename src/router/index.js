const Router = require('express');

const routerApp = new Router();
const { body } = require('express-validator');
const { validate } = require('../middlewares/validate');
const { User } = require('../models/user-models.js');
const UserDto = require('../dtos/user-dto.js');
const { Room } = require('../models/room-models.js');
const RoomDto = require('../dtos/room-dto.js');
const { Message } = require('../models/message-models.js');
const MessageDto = require('../dtos/message-dto.js');

routerApp.post(
  '/register',
  body('name').notEmpty(),
  validate,
  async (req, res) => {
    const { name } = req.body;

    const candidate = await User.findOne({
      where: {
        name,
      },
    });

    if (candidate) {
      throw Error({
        message: 'This name have other Users, pleas change your Name!',
      });
    }

    const user = await User.create({
      name,
    });

    const userDto = new UserDto(user);

    return res.json(userDto);
  },
);

routerApp.post(
  '/create-room',
  body('name').notEmpty(),
  validate,
  async (req, res) => {
    const { name } = req.body;

    const candidate = await Room.findOne({
      where: {
        name,
      },
    });

    if (candidate) {
      throw Error({
        message: 'This name have other Room, pleas change your Room!',
      });
    }

    const room = await Room.create({
      name,
    });

    const roomDto = new RoomDto(room);

    return res.json(roomDto);
  },
);

routerApp.get('/room', async (req, res) => {
  const rooms = await Room.findAll();

  if (!rooms.length < 0) {
    return res.json([]);
  }

  const normalizeRooms = [];

  for (const r of rooms) {
    normalizeRooms.push(new RoomDto(r));
  }

  return res.json(normalizeRooms);
});

routerApp.delete('/room/:id', async (req, res) => {
  const { id } = req.params;

  await Room.destroy({
    where: { id },
  });

  return res.send({ message: 'Deleted' });
});

routerApp.patch(
  '/room/:id',
  body('name').notEmpty(),
  validate,
  async (req, res) => {
    const { name } = req.body;
    const { id } = req.params;

    const candidate = await Room.findByPk(id);

    if (!candidate) {
      throw Error('Not found Room');
    }

    const roomDto = new RoomDto(await candidate.update({ name }));

    return res.json(roomDto);
  },
);

routerApp.get('/chat', async (req, res) => {
  const { id } = req.body;

  const room = await Room.findByPk(id, {
    include: [{ model: Message }],
  });

  return res.json(room);
});

routerApp.post(
  '/message',
  body('author').notEmpty(),
  body('text').notEmpty(),
  body('roomId').notEmpty(),
  validate,
  async (req, res) => {
    const { roomId, author, text } = req.body;

    await Message.create({
      text: text,
      author: author,
      roomId: roomId,
    });

    const room = await Room.findByPk(roomId, {
      include: [
        {
          model: Message,
        },
      ],
    });

    const normalizeMessage = [];

    for (const m of room.dataValues.messages) {
      normalizeMessage.push(new MessageDto(m));
    }

    return res.json(normalizeMessage);
  },
);

routerApp.get('/message', async (req, res) => {
  const { id } = req.query;

  const room = await Room.findByPk(id, {
    include: [{ model: Message }],
  });

  return res.send(room.dataValues.messages);
});

module.exports = {
  routerApp,
};
