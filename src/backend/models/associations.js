'use strict';

const User = require('./User');
const Room = require('./Room');
const Message = require('./Message');
const RoomMember = require('./RoomMember');

Room.belongsToMany(User, {
  through: RoomMember,
  as: 'members',
  foreignKey: 'roomId',
  otherKey: 'userId',
  onDelete: 'CASCADE',
});

User.belongsToMany(Room, {
  through: RoomMember,
  as: 'rooms',
  foreignKey: 'userId',
  otherKey: 'roomId',
  onDelete: 'CASCADE',
});

User.hasMany(Room, {
  as: 'ownedRooms',
  foreignKey: {
    allowNull: true,
    name: 'ownerUserId',
  },
  onDelete: 'SET NULL',
});

Room.belongsTo(User, {
  as: 'owner',
  foreignKey: {
    allowNull: true,
    name: 'ownerUserId',
  },
});

Room.hasMany(Message, {
  as: 'messages',
  foreignKey: {
    allowNull: false,
    name: 'roomId',
  },
  onDelete: 'CASCADE',
});

Message.belongsTo(Room, {
  as: 'room',
  foreignKey: {
    allowNull: false,
    name: 'roomId',
  },
});

User.hasMany(Message, {
  as: 'messages',
  foreignKey: {
    allowNull: false,
    name: 'userId',
  },
  onDelete: 'CASCADE',
});

Message.belongsTo(User, {
  as: 'author',
  foreignKey: {
    allowNull: false,
    name: 'userId',
  },
});

module.exports = {
  User,
  Room,
  Message,
  RoomMember,
};
