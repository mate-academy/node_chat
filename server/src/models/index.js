import { Message } from './message.js';
import { Room } from './room.js';
import { User } from './user.js';

User.belongsToMany(Room, { through: 'user_rooms' });
Room.belongsToMany(User, { through: 'user_rooms' });

Message.belongsTo(User, {
  foreignKey: 'userId',
  as: 'author',
});

User.hasMany(Message, {
  foreignKey: 'userId',
  as: 'messages',
});

Message.belongsTo(Room);
Room.hasMany(Message);

export { User, Room, Message };
