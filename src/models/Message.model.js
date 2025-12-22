'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('./../db/db');

const Message = sequelize.define(
  'Message',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    roomId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    text: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'messages',
    timestamps: true,
  },
);

module.exports = {
  Message,
};
