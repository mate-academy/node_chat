const { DataTypes } = require('sequelize');
const { sequelize } = require('./index.js');
const Chat = require('./Chat.js');
const User = require('./User.js');

const Message = sequelize.define(
  'Message',
  {
    text: { type: DataTypes.TEXT, allowNull: false },
  },
  {
    tableName: 'messages_',
  },
);

Message.belongsTo(Chat, { foreignKey: 'ChatId' });
Message.belongsTo(User, { foreignKey: 'UserId' });
Chat.hasMany(Message, { foreignKey: 'ChatId' });
User.hasMany(Message, { foreignKey: 'UserId' });

module.exports = Message;
