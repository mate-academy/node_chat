const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('sqlite::memory:');
const User = require('./user');
const Room = require('./room');

const Message = sequelize.define('Message', {
  content: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Message.belongsTo(User);
User.hasMany(Message); // Changed from User.hasOne(Message)

Message.belongsTo(Room);
Room.hasMany(Message); // Changed from Room.hasOne(Message)

module.exports = Message;
