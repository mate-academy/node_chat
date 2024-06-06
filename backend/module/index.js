const { User } = require('./user.module');
const { Room } = require('./room.module');
const { Message } = require('./message.module');

User.hasMany(Room, { foreignKey: 'idUser', as: 'rooms' });
User.hasMany(Message, { foreignKey: 'idUser', as: 'messages' });
Room.hasMany(Message, { foreignKey: 'idRoom', as: 'room' });

Room.belongsTo(User, { foreignKey: 'idUser', as: 'user' });
Message.belongsTo(User, { foreignKey: 'idUser', as: 'user' });
Message.belongsTo(Room, { foreignKey: 'idRoom', as: 'room' });

module.exports = {
  User,
  Room,
  Message,
}
