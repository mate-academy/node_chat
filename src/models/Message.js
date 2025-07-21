const { DataTypes } = require('sequelize');
const { client } = require('../utils/db.js');
const { User } = require('./User.js');
const { Room } = require('./Room.js');

const Message = client.define('message', {
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  time: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
});

Message.belongsTo(User);
User.hasMany(Message);
Message.belongsTo(Room);
Room.hasMany(Message);

module.exports = { Message };
