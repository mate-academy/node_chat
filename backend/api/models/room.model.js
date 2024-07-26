const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db');
const { User } = require('./users.model');

const Room = sequelize.define(
  'Room',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createByUserId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
  },
  {
    timestamps: false,
    tableName: 'rooms',
  },
);

module.exports = {
  Room,
};
