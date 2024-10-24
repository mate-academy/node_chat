const { DataTypes } = require('sequelize');
const { client } = require('../db');
const { Room } = require('./Room.model');

const Message = client.define('messages', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  text: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Room.hasMany(Message);
Message.belongsTo(Room);

module.exports = {
  Message,
};
