'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/db.js');
const { Room } = require('./Room.js');

const Message = sequelize.define(
  'message',
  {
    author: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    text: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    createdAt: false,
    updatedAt: false,
  }
);

Message.belongsTo(Room);
Room.hasOne(Message);

module.exports = {
  Message,
};
