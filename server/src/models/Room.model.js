'use strict';

const { sequelize } = require('../db.js');
const { DataTypes } = require('sequelize');
const { Message } = require('./Message.model.js');

const Room = sequelize.define(
  'Room',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    owner: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'rooms',
    timestamps: true,
  },
);

// Room.hasMany(Message, { foreignKey: 'roomId' });

module.exports = {
  Room,
};
