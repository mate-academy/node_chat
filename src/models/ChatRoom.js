const { DataTypes } = require('sequelize');
const { client } = require('../utils/db.js');
const { Account } = require('./Account.js');

const ChatRoom = client.define('chat_room', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

ChatRoom.belongsTo(Account, { foreignKey: 'ownerId' });
Account.hasMany(ChatRoom, { foreignKey: 'ownerId' });

module.exports = { ChatRoom };
