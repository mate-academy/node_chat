const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db');
const { UserRoom } = require('./userRooms.model');
const { User } = require('./users.model');

const Room = sequelize.define(
  'Room',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    roomName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    tableName: 'rooms',
    createdAt: false,
    updatedAt: false,
  },
);

const services = {
  getAll: async (userId) => {
    return Room.findAll({
      include: [
        {
          model: User,
          as: 'subscribers',
          where: { id: userId },
          through: { attributes: [] },
        },
      ],
    });
  },

  getById: async (id) => {
    return Room.findByPk(id);
  },

  search: async (roomName) => {
    const { Op } = require('sequelize');

    return Room.findAll({
      where: {
        roomName: {
          [Op.like]: `%${roomName}%`,
        },
      },
    });
  },

  create: async (data) => {
    return Room.create(data);
  },

  addUserRoom: async (userId, roomId) => {
    return UserRoom.create({
      userId,
      roomId,
    });
  },

  update: async (id, roomName) => {
    await Room.update(
      { roomName },
      {
        where: { id },
      },
    );

    return Room.findByPk(id);
  },

  delete: async (id) => {
    const room = await Room.findByPk(id);

    if (!room) {
      return null;
    }

    await Room.destroy({
      where: {
        id,
      },
    });

    return room;
  },

  removeUserRoom: async (userId, roomId) => {
    return UserRoom.destroy({
      where: {
        userId,
        roomId,
      },
    });
  },
};

module.exports = {
  Room,
  services,
};
