'use strict';

const { client } = require('../utils/db');
const { DataTypes } = require('sequelize');
const { Messages } = require('./messages');

const Chats = client.define('chat', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  chatAuthor: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Messages.belongsTo(Chats);
Chats.hasMany(Messages);

module.exports = {
  Chats,
};
