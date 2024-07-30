'use strict';

const { sequelize } = require('../utils/db');
const { DataTypes } = require('sequelize');

const Room = sequelize.define(
  'Room',
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'rooms',
    createdAt: false,
    updatedAt: false,
  },
);

module.exports = {
  Room,
};
