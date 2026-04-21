'use strict';

const { User } = require('./User.model');
const { Room } = require('./Room.model');
const { Message } = require('./Message.model');
const { UserRoom } = require('./UserRoom.model');

// 1. User <-> Message (One-to-Many)
User.hasMany(Message, { foreignKey: 'userId', as: 'messages' });
Message.belongsTo(User, { foreignKey: 'userId', as: 'author' });

// 2. Room <-> Message (One-to-Many)
Room.hasMany(Message, {
  foreignKey: 'roomId',
  as: 'messages',
  onDelete: 'CASCADE',
  hooks: true,
});
Message.belongsTo(Room, { foreignKey: 'roomId', as: 'room' });

// 3. Room <-> User (Creator) (One-to-Many)
User.hasMany(Room, { foreignKey: 'ownerId', as: 'ownedRooms' });
Room.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

// 4. User <-> Room (Many-to-Many)
User.belongsToMany(Room, {
  through: UserRoom,
  foreignKey: 'userId',
  otherKey: 'roomId',
  as: 'rooms',
});

Room.belongsToMany(User, {
  through: UserRoom,
  foreignKey: 'roomId',
  otherKey: 'userId',
  as: 'users',
});

module.exports = {
  User,
  Room,
  Message,
  UserRoom,
};
