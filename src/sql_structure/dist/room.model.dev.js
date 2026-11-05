'use strict';

const _require = require('sequelize');
const DataTypes = _require.DataTypes;

const _require2 = require('../db');
const sequelize = _require2.sequelize;

const Room = sequelize.define(
  'auth_users_room',
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: 'auth_users_room',
  },
);

module.exports = {
  Room: Room,
};
