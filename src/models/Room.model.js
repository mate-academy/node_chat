'use strict';

const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../db');

class Room extends Model {}

Room.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users', // Назва таблиці
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'rooms',
    modelName: 'room',
  },
);

module.exports = { Room };
