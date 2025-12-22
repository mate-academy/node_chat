const { User } = require('./User.model');
const { Room } = require('./Room.model');
const { Message } = require('./Message.model');

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
