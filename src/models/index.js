import { sequelize } from '../utils/db.js';
import { User } from './user.model.js';
import { Room } from './room.model.js';
import { Message } from './message.model.js';
import { UserRoom } from './userRoom.model.js';
import { Token } from './token.model.js';

User.hasMany(Message, { foreignKey: 'authorId', onDelete: 'CASCADE' });
Message.belongsTo(User, { foreignKey: 'authorId' });

Room.hasMany(Message, { foreignKey: 'roomId', onDelete: 'CASCADE' });
Message.belongsTo(Room, { foreignKey: 'roomId' });

User.hasMany(Room, { foreignKey: 'ownerId', onDelete: 'CASCADE' });
Room.belongsTo(User, { foreignKey: 'ownerId' });

User.belongsToMany(Room, {
  through: UserRoom,
  foreignKey: 'userId',
  onDelete: 'CASCADE',
});
Room.belongsToMany(User, {
  through: UserRoom,
  foreignKey: 'roomId',
  onDelete: 'CASCADE',
});

export { sequelize, User, Room, Message, UserRoom, Token };
