const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/db.js');

const Chat = sequelize.define('chat', {
  unread: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
});

module.exports = Chat;
