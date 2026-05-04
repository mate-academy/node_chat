'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');

const Room = sequelize.define(
  'Room',
  {
    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    roomKey: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
    },
    creatorUsername: {
      type: DataTypes.STRING(80),
      allowNull: true,
    },
    creatorUsernameKey: {
      type: DataTypes.STRING(80),
      allowNull: true,
    },
    ownerUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: 'rooms',
  },
);

module.exports = Room;
