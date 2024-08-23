const { DataTypes } = require('sequelize');
const { client } = require('../utils/db.js');
const { User } = require('./user.js');
const { Room } = require('./room.js');

const Message = client.define('message', {
  text: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Message.belongsTo(User);
User.hasOne(Message);

Message.belongsTo(Room);
Room.hasOne(Message);

module.exports = {
  Message,
};
