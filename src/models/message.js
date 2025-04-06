const { DataTypes } = require('sequelize');
const { client } = require('../utils/db');

const { User } = require('./user');
const { Room } = require('./room');

const Message = client.define('Message', {
  content: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// Define associations
Message.belongsTo(User);
User.hasMany(Message);

Message.belongsTo(Room);
Room.hasMany(Message);

module.exports = Message;
