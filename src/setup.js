const { Message } = require('./models/message.model.js');
const { Room } = require('./models/room.model.js');
const { User } = require('./models/user.nodel.js');

function setupAssociations() {
  User.hasMany(Message, {
    foreignKey: 'authorId',
  });

  Message.belongsTo(User, {
    foreignKey: 'authorId',
  });

  Room.hasMany(Message, {
    foreignKey: 'roomId',
  });

  Message.belongsTo(Room, {
    foreignKey: 'roomId',
  });
}

module.exports = { setupAssociations };
