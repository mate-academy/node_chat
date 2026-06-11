const { DataTypes } = require('sequelize');
const { client } = require('../db.js');

const Room = client.define('room', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});

module.exports = {
  Room,
};
