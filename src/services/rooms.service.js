import { Room } from '../models/room.model.js';

const getAllRooms = () => {
  return Room.findAll();
};

const createRoom = (title, userId, description = '') => {
  return Room.create({ title, userId, description });
};

const deleteRoom = (id) => {
  return Room.destroy({ where: { id } });
};

const updateRoom = (id, title, description) => {
  if (!id) {
    throw new Error('Room id is required');
  }

  const updatedData = {};

  if (title) {
    updatedData.title = title;
  }

  if (description) {
    updatedData.description = description;
  }

  if (Object.keys(updatedData).length === 0) {
    throw new Error('At least one field must be provided');
  }

  return Room.update(updatedData, { where: { id } });
};

export const roomsService = {
  getAllRooms,
  createRoom,
  deleteRoom,
  updateRoom,
};
