const { DataTypes } = require('sequelize');
const { client } = require('../utils/db.js');
const { User } = require('./User.js');
const { Room } = require('./Room.js');

const Message = client.define(
  'message',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    text: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    updatedAt: false,
  },
);

module.exports = {
  Message,
};

Message.belongsTo(User);
User.hasMany(Message);
Message.belongsTo(Room);
Room.hasMany(Message);
