const { DataTypes } = require('sequelize');
const { client } = require('../utils/db.js');
const { Account } = require('./Account.js');
const { ChatRoom } = require('./ChatRoom.js');

const ChatMessage = client.define('chat_message', {
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  sentAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
});

ChatMessage.belongsTo(Account, { foreignKey: 'userId' });
Account.hasMany(ChatMessage, { foreignKey: 'userId' });

ChatMessage.belongsTo(ChatRoom, { foreignKey: 'roomId' });
ChatRoom.hasMany(ChatMessage, { foreignKey: 'roomId' });

module.exports = { ChatMessage };
