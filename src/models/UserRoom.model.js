'use strict';

const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../db');

class UserRoom extends Model {}

UserRoom.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    roomId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'rooms',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
  },
  {
    sequelize,
    tableName: 'user_rooms',
    modelName: 'user_room',
    indexes: [
      {
        unique: true,
        fields: ['userId', 'roomId'],
        name: 'user_room_composite_index',
      },
    ],
  },
);

module.exports = { UserRoom };
