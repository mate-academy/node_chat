const { client } = require('../utils/db.js');
const { DataTypes } = require('sequelize');

const Room = client.define(
  'roomsSocket',
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
  },
  {
    tableName: 'roomsSocket',
  },
);

module.exports = { Room };
