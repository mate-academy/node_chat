import { User } from './user.js';
import { Room } from './room.js';
import { Message } from './message.js';

User.hasMany(Message);
Message.belongsTo(User);

Room.hasMany(Message);
Message.belongsTo(Room);

User.belongsToMany(Room, { through: 'UserRooms', as: 'rooms' });
Room.belongsToMany(User, { through: 'UserRooms', as: 'users' });

export { User, Room, Message };
