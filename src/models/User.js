const { DataTypes } = require('sequelize');
const { client } = require('../utils/db.js');

const User = client.define('user', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = { User };
