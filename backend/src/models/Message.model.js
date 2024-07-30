'use strict';

const { sequelize } = require('../utils/db');
const { DataTypes } = require('sequelize');

const Message = sequelize.define(
  'Message',
  {
    author: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    time: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    text: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    chat_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  },
  {
    tableName: 'messages',
    createdAt: false,
    updatedAt: false,
  },
);

module.exports = {
  Message,
};
