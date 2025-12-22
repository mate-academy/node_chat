'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('./../db/db');

const Room = sequelize.define(
  'Room',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    members: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      allowNull: false,
      defaultValue: [],
    },
  },
  {
    tableName: 'rooms',
    timestamps: false,
  },
);

module.exports = {
  Room,
};
