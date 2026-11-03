'use strict';

var _require = require('sequelize'),
    DataTypes = _require.DataTypes;

var _require2 = require('../db'),
    sequelize = _require2.sequelize;

var Room = sequelize.define('auth_users_room', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: false,
  tableName: 'auth_users_room'
});
module.exports = {
  Room: Room
};