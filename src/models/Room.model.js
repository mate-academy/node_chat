const { DataTypes } = require('sequelize');
const { client } = require('../db');

const Room = client.define('rooms', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = {
  Room,
};
