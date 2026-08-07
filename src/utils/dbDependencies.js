const { Room } = require('../models/rooms.model');
const { Message } = require('../models/messages.model');
const { Token } = require('../models/token.model');
const { User } = require('../models/users.model');
const { UserRoom } = require('../models/userRooms.model');

// Room <-> Messages
Room.hasMany(Message, {
  foreignKey: 'roomId',
  as: 'messages',
  onDelete: 'CASCADE',
});

Message.belongsTo(Room, {
  foreignKey: 'roomId',
  as: 'room',
});

// User <-> Token
User.hasOne(Token, {
  foreignKey: 'userId',
  as: 'token',
});

Token.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

// User <-> Messages
User.hasMany(Message, {
  foreignKey: 'userId',
  as: 'messages',
});

Message.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

// Room owner relationship
// One user owns many rooms
User.hasMany(Room, {
  foreignKey: 'userId',
  as: 'ownedRooms',
});

Room.belongsTo(User, {
  foreignKey: 'userId',
  as: 'owner',
});

// Room subscriptions relationship
// Users can subscribe to many rooms
// Rooms can have many subscribed users
User.belongsToMany(Room, {
  through: UserRoom,
  foreignKey: 'userId',
  as: 'subscribedRooms',
});

Room.belongsToMany(User, {
  through: UserRoom,
  foreignKey: 'roomId',
  as: 'subscribers',
});
