const { DataTypes } = require('sequelize');
const { client } = require('../utils/db.js');
const { User } = require('./user.model.js');
const { Room } = require('./room.model.js');

const Message = client.define('message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  messageText: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Message.belongsTo(User);
User.hasMany(Message);

Message.belongsTo(Room, {
  onDelete: 'CASCADE',
});
Room.hasMany(Message);

const initMessages = async () => {
  await Message.sync({ force: true });
};

module.exports = {
  Message,
  initMessages,
};
