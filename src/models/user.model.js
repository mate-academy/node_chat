const { DataTypes } = require('sequelize');
const { client } = require('../db');

const User = client.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rooms: {
    type: DataTypes.ARRAY(DataTypes.INTEGER), // масив кімнат
    defaultValue: [],
  },
});

module.exports = {
  User,
};
