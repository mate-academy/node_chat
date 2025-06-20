import { Room, User } from '../models/index.js';

const getAll = async () => {
  const rooms = await Room.findAll();

  return rooms;
};

const getById = async (id) => {
  const room = await Room.findByPk(id);

  return room;
};

const create = async (roomName) => {
  const newRoom = await Room.create({
    roomName,
  });

  return newRoom;
};

const rename = async (id, newRoomName) => {
  await Room.update(
    { roomName: newRoomName },
    {
      where: {
        id,
      },
    },
  );

  const updatedRoom = await getById(id);

  return updatedRoom;
};

const join = async (roomId, user) => {
  const room = await getById(roomId);

  console.log('User ', user);

  await room.addUser(user);
};

const remove = async (id) => {
  await Room.destroy({
    where: {
      id,
    },
  });
};

const getJoined = async (id) => {
  const user = await User.findByPk(id, {
    include: {
      model: Room,
      as: 'rooms',
      attributes: ['id'],
    },
  });

  const roomIds = user?.rooms.map((room) => room.id) || [];

  return roomIds;
};

export const roomService = {
  getAll,
  getById,
  create,
  rename,
  join,
  remove,
  getJoined,
};
