'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Message = sequelize.define('Message', {
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Users', key: 'id' },
  },
  roomId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Rooms', key: 'id' },
  },
});

module.exports = Message;
