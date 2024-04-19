'use strict';

const { DataTypes } = require('sequelize');
const { client } = require('../utils/db');
const { User } = require('./User');
const { Room } = require('./Room');
const { Direct } = require('./Direct');

const Message = client.define('message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  text: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Message.belongsTo(User, {
  foreignKey: 'author',
  targetKey: 'username',
  as: 'messageAuthor',
});

User.hasMany(Message, {
  sourceKey: 'username',
  foreignKey: 'author',
  as: 'messageAuthor',
});

Message.belongsTo(Room);
Room.hasMany(Message);

Message.belongsTo(Direct);
Direct.hasMany(Message);

module.exports = { Message };
