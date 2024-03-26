'use strict';

const { DataTypes } = require('sequelize');
const { db } = require('../utils/db.js');
const { User } = require('./User.js');

const Chat = db.define('chats', {
  name: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  members: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
  },
});

Chat.belongsTo(User, {
  foreignKey: 'creatorName', targetKey: 'name',
});

User.hasMany(Chat, {
  foreignKey: 'creatorName', targetKey: 'name',
});

module.exports = { Chat };
