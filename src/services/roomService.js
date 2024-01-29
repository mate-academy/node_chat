import { Room } from '../models/Room.js';

const normalize = ({ id, roomName }) => {
  return {
    id,
    roomName,
  };
};

const getAll = async() => {
  const result = await Room.findAll({
    order: ['roomName'],
  });

  return result;
};

const create = (roomName) => {
  return Room.create({ roomName });
};

const getById = (id) => {
  return Room.findByPk(id);
};

const update = async({ id, roomName }) => {
  await Room.update({ roomName }, { where: { id } });

  const updatedRoom = {
    id,
    roomName,
  };

  return updatedRoom;
};

const remove = async(id) => {
  await Room.destroy({
    where: {
      id,
    },
  });
};

export const roomService = {
  normalize,
  getAll,
  create,
  getById,
  update,
  remove,
};
