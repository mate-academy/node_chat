'use strict';

const { DataTypes } = require('sequelize');

const { sequelize } = require('../db');

const Room = sequelize.define(
  'auth_users_room',
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: 'auth_users_room',
  },
);

module.exports = {
  Room,
};
