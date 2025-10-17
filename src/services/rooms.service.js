import { Room } from '../models/room.js';

const getAllRooms = async () => {
  return Room.findAll({
    order: [['createdAt', 'DESC']],
  });
};

const createRoom = async (title, userId, description = '') => {
  if (!title || !userId) {
    throw new Error('Title and userId are required');
  }

  return Room.create({ title, userId, description });
};

const deleteRoom = async (id) => {
  if (!id) {
    throw new Error('Room id is required');
  }

  const deletedCount = await Room.destroy({ where: { id } });

  if (deletedCount === 0) {
    throw new Error('Room not found');
  }

  return deletedCount;
};

const updateRoom = async (id, title, description) => {
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

  const [updatedCount] = await Room.update(updatedData, { where: { id } });

  if (updatedCount === 0) {
    throw new Error('Room not found');
  }

  return updatedCount;
};

export const roomsService = {
  getAllRooms,
  createRoom,
  deleteRoom,
  updateRoom,
};
