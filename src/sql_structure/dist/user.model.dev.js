'use strict';

const _require = require('sequelize');
const DataTypes = _require.DataTypes;

const _require2 = require('../db');
const sequelize = _require2.sequelize;

const User = sequelize.define(
  'auth_users_1',
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: 'auth_users_1',
  },
);

module.exports = {
  User: User,
};
