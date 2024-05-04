'use strict';

const { DataTypes } = require('sequelize');
const { client } = require('../utils/db');
const { User } = require('./User');

const Room = client.define('room', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  adminId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
});

const UserRoom = client.define('user_room', {
  role: {
    type: DataTypes.ENUM(['user', 'admin']),
  },
});

Room.belongsToMany(User, { through: UserRoom });
User.belongsToMany(Room, { through: UserRoom });

module.exports = { Room };
