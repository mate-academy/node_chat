'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');

const Message = sequelize.define(
  'Message',
  {
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: 'messages',
  },
);

module.exports = Message;
