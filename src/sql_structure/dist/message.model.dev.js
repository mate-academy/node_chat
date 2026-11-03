'use strict';

var _require = require('sequelize'),
    DataTypes = _require.DataTypes;

var _require2 = require('../db'),
    sequelize = _require2.sequelize;

var Message = sequelize.define('auth_users_message', {
  text: {
    type: DataTypes.STRING,
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  roomId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: false,
  tableName: 'auth_users_message'
});
module.exports = {
  Message: Message
};