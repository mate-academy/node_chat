import { Message } from './Message.model.js';
import { ChatUser } from './ChatUser.model.js';
import { Room } from './Room.model.js';

export const setupAssociations = () => {
  Message.belongsTo(ChatUser, {
    foreignKey: 'userId',
  });

  Message.belongsTo(Room, {
    foreignKey: 'roomId',
  });

  ChatUser.hasMany(Message, {
    foreignKey: 'userId',
    onDelete: 'CASCADE',
  });

  Room.hasMany(Message, {
    foreignKey: 'roomId',
    onDelete: 'CASCADE',
  });
};
