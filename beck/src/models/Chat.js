const { DataTypes } = require('sequelize');
const { sequelize } = require('./index.js');

const Chat = sequelize.define(
  'Chat',
  {
    name: { type: DataTypes.STRING, allowNull: false },
  },
  {
    tableName: 'chats_',
  },
);

module.exports = Chat;
