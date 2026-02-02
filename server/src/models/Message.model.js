'use strict';

const { sequelize } = require('../db.js');
const { DataTypes } = require('sequelize');
const { User } = require('./User.model.js');
const { Room } = require('./Room.model.js');

const Message = sequelize.define(
  'Message',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    authorName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull:false,
    },
    roomId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'messages',
    timestamps: true,
  },
);

// Message.belongsTo(User, { foreignKey: 'userId' });
// Message.belongsTo(Room, { foreignKey: 'roomId' });

// User.hasMany(Message, { foreignKey: 'userId' });
// Room.hasMany(Message, { foreignKey: 'roomId' });

module.exports = {
  Message,
};
