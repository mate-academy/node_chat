const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db');
const { User } = require('./user.model');

const Room = sequelize.define(
  'room',
  {
    name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
  },
  {
    createdAt: false,
    updatedAt: false,
  },
);

Room.belongsTo(User);
User.hasMany(Room);

module.exports = { Room };
