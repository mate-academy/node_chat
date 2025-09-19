import { User } from './user.js';
import { Message } from './message.js';
import { Room } from './room.js';

User.hasMany(Message, { foreignKey: 'userId' });
Message.belongsTo(User, { foreignKey: 'userId' });

Room.hasMany(Message, { foreignKey: 'roomId' });
Message.belongsTo(Room, { foreignKey: 'roomId' });

User.belongsToMany(Room, { through: 'user_room', foreignKey: 'userId' });
Room.belongsToMany(User, { through: 'user_room', foreignKey: 'roomId' });
