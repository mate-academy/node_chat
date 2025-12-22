'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/db.js');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: 'users',
    timestamps: false,
  },
);

module.exports = {
  User,
};
