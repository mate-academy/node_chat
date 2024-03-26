'use strict';

const { DataTypes } = require('sequelize');
const { db } = require('../utils/db.js');
const { User } = require('./User.js');
const { Chat } = require('./Chat.js');

const Message = db.define('messages', {
  text: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  updatedAt: false,
});

Message.belongsTo(User, {
  foreignKey: 'creatorName', targetKey: 'name',
});

User.hasMany(Message, {
  foreignKey: 'creatorName', targetKey: 'name',
});

Message.belongsTo(Chat);
Chat.hasMany(Message);

module.exports = { Message };
