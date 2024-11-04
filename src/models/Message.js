const { DataTypes, UUIDV4, NOW } = require('sequelize');
const { client } = require('../db');
const { Room } = require('./Room');

const Message = client.define('messages', {
  id: {
    type: DataTypes.UUID,
    defaultValue: UUIDV4,
    primaryKey: true,
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  text: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  time: {
    type: DataTypes.DATE,
    defaultValue: NOW,
  },
});

Message.belongsTo(Room);
Room.hasMany(Message);

module.exports = { Message };
