const { User } = require('./user-models.js');
const { Room } = require('./room-models.js');
const { Message } = require('./message-models.js');

Message.belongsTo(User, {
  foreignKey: 'userId',
});

User.hasMany(Message, {
  foreignKey: 'userId',
});

Room.hasMany(Message, {
  foreignKey: 'roomId',
});

Message.belongsTo(Room, {
  foreignKey: 'roomId',
});
