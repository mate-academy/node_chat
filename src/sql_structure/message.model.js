'use strict';

const { DataTypes } = require('sequelize');

const { sequelize } = require('../db');

const Message = sequelize.define(
  'auth_users_message',
  {
    text: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    roomId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: 'auth_users_message',
  },
);

module.exports = {
  Message,
};
