const { DataTypes } = require('sequelize');
const { client } = require('../db.js');

const User = client.define('user', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});

module.exports = {
  User,
};
