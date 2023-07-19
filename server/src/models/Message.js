'use strict';

const { sequelize } = require('../database/db');
const { DataTypes } = require('sequelize');

const Message = sequelize.define('Message', {
  message: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  room: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  createdtime: {
    type: DataTypes.DATE,
    field: 'createdtime',
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'messages',
});

module.exports = { Message };
