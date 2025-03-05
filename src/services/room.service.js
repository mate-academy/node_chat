import { Room } from '../models/Room.js';

export const normalize = ({ id, title, description, userId }) => ({
  id,
  title,
  description,
  userId,
});

export const createRoom = (title, userId, description = '') => {
  return Room.create({ title, userId, description });
};

export const removeRoom = (id) => {
  return Room.destroy({ where: { id } });
};

export const updateRoom = async (id, title, description) => {
  if (!id) {
    throw new Error('roomId is required');
  }

  const updateData = {};

  if (title) {
    updateData.title = title;
  }

  if (description) {
    updateData.description = description;
  }

  if (Object.keys(updateData).length === 0) {
    throw new Error(
      'At least one field (title or description) must be provided',
    );
  }

  return Room.update(updateData, { where: { id } });
};

export const getAllRooms = () => {
  return Room.findAll();
};
