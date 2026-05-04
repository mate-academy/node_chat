'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');

const User = sequelize.define(
  'User',
  {
    username: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },
    usernameKey: {
      type: DataTypes.STRING(80),
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: 'users',
  },
);

module.exports = User;
