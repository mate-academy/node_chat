'use strict';

/* eslint-disable no-console */

const sequelize = require('../config/db');
const User = require('./User');
const Room = require('./Room');
const Message = require('./Message');

// Associations
User.hasMany(Message, { foreignKey: 'userId', as: 'messages' });
Message.belongsTo(User, { foreignKey: 'userId', as: 'author' });

Room.hasMany(Message, {
  foreignKey: 'roomId',
  as: 'messages',
  onDelete: 'CASCADE',
});
Message.belongsTo(Room, { foreignKey: 'roomId', as: 'room' });

const syncDatabase = async () => {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });
  console.log('Database connected and synced.');
};

module.exports = {
  sequelize,
  User,
  Room,
  Message,
  syncDatabase,
};
