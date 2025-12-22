const { User } = require('./User');
const { Room } = require('./Room');
const { Message } = require('./Message');

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

module.exports = {
  User,
  Room,
  Message,
};
