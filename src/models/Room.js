const { DataTypes } = require('sequelize');
const { client } = require('../utils/db.js');
const { User } = require('./User.js');

const Room = client.define('room', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Room.belongsTo(User);
User.hasMany(Room);

module.exports = { Room };
