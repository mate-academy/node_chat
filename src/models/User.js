'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  socketId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = User;
