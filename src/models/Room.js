'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Room = sequelize.define('Room', {
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
});

module.exports = Room;
