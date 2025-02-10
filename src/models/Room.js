const { DataTypes } = require('sequelize');
const { client } = require('../utils/db.js');
const { User } = require('./User.js');

const Room = client.define('room', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = {
  Room,
};

Room.belongsTo(User);
User.hasMany(Room);
