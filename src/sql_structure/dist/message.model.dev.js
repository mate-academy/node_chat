'use strict';

const _require = require('sequelize');
const DataTypes = _require.DataTypes;

const _require2 = require('../db');
const sequelize = _require2.sequelize;

const Message = sequelize.define(
  'auth_users_message',
  {
    text: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    roomId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: 'auth_users_message',
  },
);

module.exports = {
  Message: Message,
};
