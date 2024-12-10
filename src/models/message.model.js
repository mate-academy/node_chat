const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db');
const { User } = require('./user.model');
const { Room } = require('./room.model');

const Message = sequelize.define(
  'message',
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  {
    updatedAt: false,
  },
);

Message.belongsTo(User);
Message.belongsTo(Room);
Room.hasMany(Message);
User.hasMany(Message);

module.exports = { Message };
