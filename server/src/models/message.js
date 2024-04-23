/* eslint-disable no-console */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/db.js');
const Chat = require('./chat.js');

const Message = sequelize.define('message', {
  chatId: {
    type: DataTypes.INTEGER,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  text: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  read: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});

Message.addHook('afterCreate', async (message, options) => {
  try {
    await Chat.increment('unread', { where: { id: message.chatId } });
  } catch (error) {
    console.error('Error updating unread count:', error);
    throw error;
  }
});

Message.addHook('afterUpdate', async (message, options) => {
  try {
    const unreadCount = await Message.count({
      where: {
        chatId: message.chatId,
        read: false,
      },
    });

    await Chat.update(
      { unread: unreadCount },
      { where: { id: message.chatId } },
    );
  } catch (error) {
    console.error('Error updating unread count:', error);
    throw error;
  }
});

module.exports = Message;
