const { DataTypes } = require('sequelize');
const { client } = require('../utils/db.js');
const { Room } = require('./room.model.js');
const { User } = require('./user.model.js');

const Message = client.define(
  'message',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    text: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: 'messages',
  },
);

Message.belongsTo(Room, { onDelete: 'CASCADE' });
Message.belongsTo(User);
Room.hasMany(Message);

const initMessages = async () => {
  await Message.sync({ force: true });
};

module.exports = { Message, initMessages };
