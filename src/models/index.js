import { Room } from './room.model.js';
import { Message } from './message.model.js';
import { User } from './user.model.js';

Message.belongsTo(User, {
  foreignKey: 'authorId',
  as: 'author',
  onDelete: 'CASCADE',
});

Message.belongsTo(Room, {
  foreignKey: 'roomId',
  as: 'room',
  onDelete: 'CASCADE',
});

User.hasMany(Message, {
  foreignKey: 'authorId',
  as: 'messages',
});

Room.hasMany(Message, {
  foreignKey: 'roomId',
  as: 'messages',
});

export { Room, Message, User };
