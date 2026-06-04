const { DataTypes } = require('sequelize');
const { client } = require('../db.js');

const Message = client.define('message', {
  author: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  text: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = {
  Message,
};
