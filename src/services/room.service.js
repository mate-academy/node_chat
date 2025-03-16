import { Room } from '../models/Room.model';

export const createRoom = async (name) => {
  const room = await Room.create({ name });

  return room;
};

export const joinRoom = async (id) => {
  const room = await Room.findByPk({ id });

  return room;
};

export const removeRoom = async (id) => {
  await Room.destroy({ where: { id } });
};

export const renameRoom = async (id, name) => {
  const room = Room.update({ name }, { where: { id } });

  return room;
};
