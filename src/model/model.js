import User from './User.model.js';
import Message from './Message.model.js';
import Room from './Room.model.js';

User.hasMany(Message, {
  foreignKey: 'authorId',
  as: 'messages',
});

Message.belongsTo(User, {
  foreignKey: 'authorId',
  as: 'author',
});

Room.hasMany(Message, {
  foreignKey: 'roomId',
  as: 'messages',
});

Message.belongsTo(Room, {
  foreignKey: 'roomId',
  as: 'room',
});

export { User, Message, Room };
