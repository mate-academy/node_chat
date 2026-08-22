import User from './User.js';
import Room from './Room.js';
import Message from './Message.js';

User.hasMany(Message, {
  foreignKey: 'userId',
  onDelete: 'CASCADE',
});

Message.belongsTo(User, {
  foreignKey: 'userId',
});

Room.hasMany(Message, {
  foreignKey: 'roomId',
  onDelete: 'CASCADE',
});

Message.belongsTo(Room, {
  foreignKey: 'roomId',
});

User.belongsToMany(Room, {
  through: 'RoomUsers',
  foreignKey: 'userId',
});

Room.belongsToMany(User, {
  through: 'RoomUsers',
  foreignKey: 'roomId',
});

export { User, Room, Message };
