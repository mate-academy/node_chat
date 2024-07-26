const { sequelize } = require('../utils/db');
const { Message } = require('./message.model');
const { Room } = require('./room.model');
const { User } = require('./users.model');

User.hasMany(Room, {
  foreignKey: 'createByUserId',
  as: 'roomsCreated',
});
Room.belongsTo(User, {
  foreignKey: 'createByUserId',
  as: 'creator',
});

User.hasMany(Message, {
  foreignKey: 'senderId',
  as: 'messagesSent',
});
Message.belongsTo(User, {
  foreignKey: 'senderId',
  as: 'sender',
});

Room.hasMany(Message, {
  foreignKey: 'roomId',
  as: 'messages',
});
Message.belongsTo(Room, {
  foreignKey: 'roomId',
  as: 'room',
});

const initTables = async () => {
  await sequelize.sync({ force: true });
};

module.exports = {
  User,
  Room,
  Message,
  initTables,
};
