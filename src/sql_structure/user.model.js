'use strict';

const { DataTypes } = require('sequelize');

const { sequelize } = require('../db');

const User = sequelize.define(
  'auth_users_1',
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: 'auth_users_1',
  },
);

module.exports = {
  User,
};
