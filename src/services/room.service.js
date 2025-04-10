import { Room } from '../models/Room.js';

export const normalize = ({ id, title, description, userId }) => ({
  id,
  title,
  description,
  userId,
});

export const getAllRooms = () => {
  return Room.findAll();
};

export const createRoom = (title, userId, description = '') => {
  return Room.create({ title, userId, description });
};

export const removeRoom = (id) => {
  return Room.destroy({ where: { id } });
};

export const updateRoom = async (id, title, description) => {
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
