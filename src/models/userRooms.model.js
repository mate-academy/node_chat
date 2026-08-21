const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db');

const UserRoom = sequelize.define(
  'UserRoom',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    roomId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    tableName: 'user_rooms',
    createdAt: false,
    updatedAt: false,
  },
);

const services = {
  create: async (userId, roomId) => {
    return UserRoom.create({
      userId,
      roomId,
    });
  },

  delete: async (userId, roomId) => {
    return UserRoom.destroy({
      where: {
        userId,
        roomId,
      },
    });
  },

  deleteByRoomId: async (roomId) => {
    return UserRoom.destroy({
      where: {
        roomId,
      },
    });
  },

  getByRoomId: async (roomId) => {
    return UserRoom.findAll({
      where: {
        roomId,
      },
    });
  },
};

module.exports = {
  UserRoom,
  services,
};
