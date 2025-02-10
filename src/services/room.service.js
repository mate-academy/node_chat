const { Room } = require('../models/Room');

const normalize = ({ id, title, description, userId }) => {
  return {
    id,
    title,
    description,
    userId,
  };
};

const createRoom = (title, userId, description = '') => {
  return Room.create({ title, userId, description });
};

const removeRoom = (id) => {
  return Room.destroy({ where: { id } });
};

const updateRoom = async (id, title, description) => {
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

  return Room.update(updateData, {
    where: { id },
  });
};

const getAllRooms = () => {
  return Room.findAll();
};

module.exports = {
  normalize,
  createRoom,
  getAllRooms,
  updateRoom,
  removeRoom,
};
