const { client } = require('../utils/db.js');
const { Room } = require('./room.model.js');
const { User } = require('./user.model.js');

const UserRoom = client.define('user_room', {}, { timestamps: false });

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

module.exports = { UserRoom };
