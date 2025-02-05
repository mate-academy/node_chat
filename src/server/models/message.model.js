const { client } = require('../utils/db.js');
const { DataTypes } = require('sequelize');
const { User } = require('./user.model.js');
const { Room } = require('./room.model.js');

const Message = client.define(
  'messagesSocket',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    text: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    roomId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'messagesSocket',
  },
);

Message.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasMany(Message, { foreignKey: 'userId' });

Message.belongsTo(Room, { foreignKey: 'roomId', onDelete: 'CASCADE' });
Room.hasMany(Message, { foreignKey: 'roomId' });

module.exports = { Message };
