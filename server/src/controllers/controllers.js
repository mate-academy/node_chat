import { Room, User, Message } from '../models/index.js';

const createRoom = async (req, res, next) => {
  const { roomName, userId } = req.body;

  const user = await User.findByPk(userId);

  if (!user) {
    return res.status(404).json({
      message: 'User not found',
    });
  }

  const room = await Room.create({ name: roomName });

  await room.addUser(user);

  res.status(201).json(room);
};

const renameRoom = async (req, res, next) => {
  const { roomName } = req.body;
  const { roomId } = req.params;

  const room = await Room.findByPk(roomId);

  if (!room) {
    return res.status(404).json({
      message: 'Room not found',
    });
  }

  room.name = roomName;
  await room.save();

  res.status(200).json(room);
};

const joinUser = async (req, res, next) => {
  const { roomId } = req.params;
  const { username } = req.body;

  const room = await Room.findByPk(roomId);

  if (!room) {
    return res.status(404).json({
      message: 'Room not found',
    });
  }

  const user = await User.findOne({
    where: {
      username,
    },
  });

  if (!user) {
    return res.status(404).json({
      message: 'User not found',
    });
  }

  await room.addUser(user);

  res.status(200).json({
    message: 'User joined the room',
  });
};

const leaveRoom = async (req, res, next) => {
  const { roomId } = req.params;
  const { username } = req.body;

  const room = await Room.findByPk(roomId);

  if (!room) {
    return res.status(404).json({
      message: 'Room not found',
    });
  }

  const user = await User.findOne({
    where: {
      username,
    },
  });

  if (!user) {
    return res.status(404).json({
      message: 'User not found',
    });
  }

  await room.removeUser(user);

  res.status(200).json({
    message: 'User left the room',
  });
};

const deleteRoom = async (req, res, next) => {
  const { roomId } = req.params;
  const room = await Room.findByPk(roomId);

  if (!room) {
    return res.status(404).json({
      message: 'Room not found',
    });
  }

  await room.destroy();

  res.sendStatus(204);
};

const getRoomMessages = async (req, res, next) => {
  const { roomId } = req.params;
  const messages = await Message.findAll({
    where: {
      roomId,
    },
    include: [
      {
        model: User,
        attributes: ['id', 'username'],
      },
    ],
    order: [['createdAt', 'ASC']],
  });

  return res.status(200).json(messages);
};

const getRooms = async (req, res) => {
  const { userId } = req.query;
  const user = await User.findByPk(userId);

  if (!user) {
    return res.status(404).json({
      message: 'User not found',
    });
  }

  const rooms = await Room.findAll({
    include: [
      {
        model: User,
        where: { id: userId },
        attributes: [],
        through: { attributes: [] },
      },
    ],
    order: [['name', 'ASC']],
  });

  res.status(200).json(rooms);
};

const createUser = async (req, res) => {
  const { username } = req.body;

  if (!username?.trim()) {
    return res.status(400).json({
      message: 'Username is required',
    });
  }

  const existingUser = await User.findOne({
    where: {
      username: username.trim(),
    },
  });

  if (existingUser) {
    return res.status(200).json(existingUser);
  }

  const user = await User.create({
    username: username.trim(),
  });

  return res.status(201).json(user);
};

export {
  createRoom,
  renameRoom,
  joinUser,
  leaveRoom,
  deleteRoom,
  getRoomMessages,
  getRooms,
  createUser,
};
