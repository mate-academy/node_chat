const { DataTypes } = require('sequelize');
const { client } = require('../utils/db.js');

const Room = client.define('room', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = {
  Room,
};
